#!/usr/bin/env python3
"""One-time migration: Next.js (App Router) frontend -> Vite + React + React Router.

Mechanical, behavior-preserving conversion:
- app/<route>/page.jsx  ->  src/pages/<Name>.jsx
- components/*, store/*, lib/* move under src/ unchanged (except imports)
- next/link -> react-router-dom Link (href -> to)
- next/navigation useRouter -> useNavigate (router.push/replace -> navigate)
- next/navigation useParams / useSearchParams -> react-router-dom equivalents
- 'use client' directives removed (everything is client-side in Vite)
- relative imports re-resolved to the new file locations

Run from the project root:  python3 scripts/migrate_to_react.py
"""
import os
import re
import shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OLD = os.path.join(ROOT, "frontend")
NEW = os.path.join(ROOT, "frontend-react")

# old path (relative to frontend/) -> new path (relative to frontend-react/)
FILE_MAP = {
    "app/page.jsx": "src/pages/Home.jsx",
    "app/listings/page.jsx": "src/pages/Listings.jsx",
    "app/listings/[id]/page.jsx": "src/pages/ListingDetail.jsx",
    "app/agents/page.jsx": "src/pages/Agents.jsx",
    "app/auth/page.jsx": "src/pages/Auth.jsx",
    "app/blogs/page.jsx": "src/pages/Blogs.jsx",
    "app/blogs/[slug]/page.jsx": "src/pages/BlogDetail.jsx",
    "app/contact/page.jsx": "src/pages/Contact.jsx",
    "app/dashboard/page.jsx": "src/pages/Dashboard.jsx",
    "app/projects/page.jsx": "src/pages/Projects.jsx",
    "app/viewings/page.jsx": "src/pages/Viewings.jsx",
    "app/payments/page.jsx": "src/pages/Payments.jsx",
    "app/not-found.jsx": "src/pages/NotFound.jsx",
    "components/Header.jsx": "src/components/Header.jsx",
    "components/Footer.jsx": "src/components/Footer.jsx",
    "store/authStore.js": "src/store/authStore.js",
    "store/filterStore.js": "src/store/filterStore.js",
    "lib/listingFilters.js": "src/lib/listingFilters.js",
    "app/globals.css": "src/index.css",
}


def resolve_old_import(from_dir, spec):
    """Resolve a relative import spec to an old-tree path (relative to frontend/)."""
    joined = os.path.normpath(os.path.join(from_dir, spec))
    return joined.replace(os.sep, "/")


def remap_import(old_file_rel, new_file_rel, spec):
    """Rewrite one relative import spec for the new tree, or return it unchanged."""
    if not spec.startswith("."):
        return spec
    old_dir = os.path.dirname(old_file_rel)
    target_old = resolve_old_import(old_dir, spec)
    # Split off any file extension for mapping lookup.
    base, ext = os.path.splitext(target_old)
    target_new = None
    for old_path, new_path in FILE_MAP.items():
        if os.path.splitext(old_path)[0] == base:
            target_new = os.path.splitext(new_path)[0]
            break
    if target_new is None:
        # Target did not move (e.g. a file copied verbatim under src/).
        # Only store/lib/components moved, all covered above; otherwise keep.
        return spec
    new_dir = os.path.dirname(new_file_rel)
    rel = os.path.relpath(target_new, new_dir).replace(os.sep, "/")
    if not rel.startswith("."):
        rel = "./" + rel
    return rel


def strip_metadata_block(text):
    """Remove `export const metadata = {...};` blocks if present."""
    out = []
    i = 0
    while True:
        m = re.search(r"export\s+const\s+metadata\s*=\s*\{", text[i:])
        if not m:
            out.append(text[i:])
            break
        start = i + m.start()
        out.append(text[i:start])
        j = i + m.end() - 1  # position of the opening brace
        depth = 0
        while j < len(text):
            if text[j] == "{":
                depth += 1
            elif text[j] == "}":
                depth -= 1
                if depth == 0:
                    break
            j += 1
        j += 1  # past closing brace
        if j < len(text) and text[j] == ";":
            j += 1
        i = j
    return "".join(out)


def convert_file(old_rel, new_rel, text):
    # 1. Drop 'use client' directives.
    text = re.sub(r"^['\"]use client['\"];?\s*\n", "", text, flags=re.MULTILINE)
    # 2. Drop metadata exports (layout-only; kept as a safety net).
    text = strip_metadata_block(text)
    # 3. next/link -> react-router-dom.
    text = text.replace("from 'next/link'", "from 'react-router-dom'")
    # 4. next/navigation -> react-router-dom with identifier mapping.
    def nav_repl(m):
        names = [n.strip() for n in m.group(1).split(",")]
        mapped = []
        for n in names:
            if n == "useRouter":
                mapped.append("useNavigate")
            else:
                mapped.append(n)
        return "import { " + ", ".join(mapped) + " } from 'react-router-dom'"
    text = re.sub(r"import\s*\{\s*([^}]+?)\s*\}\s*from\s*'next/navigation'", nav_repl, text)
    # 5. Router variable + calls.
    text = text.replace("const router = useNavigate();", "const navigate = useNavigate();")
    # router.replace(x); -> navigate(x, { replace: true });
    def replace_repl(m):
        inner = m.group(1).rstrip()
        if inner.endswith(";"):
            inner = inner[:-1]
        return f"navigate({inner}, {{ replace: true }});"
    text = re.sub(r"router\.replace\((.*)\);\s*\n", lambda m: replace_repl(m) + "\n", text)
    text = text.replace("router.push(", "navigate(")
    # 6. useSearchParams: Next returns the object; React Router returns a tuple.
    text = text.replace("const searchParams = useSearchParams();", "const [searchParams] = useSearchParams();")
    # 7. Link href -> to (only on <Link ...> tags).
    text = re.sub(r"<Link(\s+)href=", r"<Link\1to=", text)
    # 8. Relative imports re-resolved to the new tree.
    def imp_repl(m):
        quote = m.group(1)
        spec = m.group(2)
        new_spec = remap_import(old_rel, new_rel, spec)
        return f"from {quote}{new_spec}{quote}"
    text = re.sub(r"from\s+(['\"])([^'\"]+)\1", imp_repl, text)
    return text


def main():
    if os.path.exists(NEW):
        shutil.rmtree(NEW)
    for old_rel, new_rel in FILE_MAP.items():
        src = os.path.join(OLD, old_rel)
        dst = os.path.join(NEW, new_rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        with open(src, encoding="utf-8") as fh:
            content = fh.read()
        if new_rel.endswith((".jsx", ".js")):
            content = convert_file(old_rel, new_rel, content)
        with open(dst, "w", encoding="utf-8") as fh:
            fh.write(content)
        print(f"  {old_rel} -> {new_rel}")
    # Public assets (local images) carry over unchanged.
    src_public = os.path.join(OLD, "public")
    dst_public = os.path.join(NEW, "public")
    if os.path.isdir(src_public):
        shutil.copytree(src_public, dst_public)
        print("  public/ -> public/")
    print("Done.")


if __name__ == "__main__":
    main()
