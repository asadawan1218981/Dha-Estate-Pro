import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../lib/api';

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogDetail = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/blogs/${slug}`);
        if (response.ok) {
          const data = await response.json();
          setBlog(data.blog);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogDetail();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="h-64 bg-gray-200 w-full mb-6" />
        <div className="h-8 bg-gray-200 w-1/3 mx-auto mb-4" />
        <div className="h-4 bg-gray-200 w-2/3 mx-auto" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif font-bold text-2xl text-charcoal">Article Not Found</h2>
        <Link to="/blogs" className="btn-luxury py-2.5 px-6 mt-6 inline-block">Back to Blogs</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-fade-in text-charcoal">
      
      {/* Back Button */}
      <Link
        to="/blogs"
        className="flex items-center space-x-2 text-xxs font-bold uppercase tracking-widest text-primary hover:text-primary-dark mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Insights</span>
      </Link>

      {/* Meta header */}
      <div className="space-y-4 mb-8">
        <span className="bg-primary text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1">
          {blog.category}
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-charcoal leading-tight">
          {blog.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-xxs font-semibold uppercase tracking-wider text-gray-400 border-b border-t border-charcoal/5 py-3">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-primary" />
            <span>Written By {blog.authorName}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span>Published {new Date(blog.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Hero Image */}
      <div className="relative h-[40vh] md:h-[50vh] bg-charcoal overflow-hidden shadow-luxury border border-charcoal/5 mb-10">
        <img
          src={blog.coverImage}
          alt={blog.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content Body */}
      <article className="prose max-w-none text-xs text-gray-600 leading-relaxed space-y-6">
        {blog.content.split('\n\n').map((paragraph, index) => (
          <p key={index} className="pl-4 border-l-2 border-primary/10">
            {paragraph}
          </p>
        ))}
      </article>

      {/* Bottom Legal Vetting Disclaimer */}
      <div className="mt-16 p-6 bg-gray-50 border border-charcoal/5 text-xxs font-semibold uppercase tracking-wider text-gray-400 text-center space-y-2">
        <Bookmark className="w-5 h-5 text-primary mx-auto" />
        <p>Disclaimer: Real estate market values fluctuate based on KIBOR changes and DHA Administrator tax policies. Insights provided by DHA Estate Pro are for demonstration purposes only.</p>
      </div>

    </div>
  );
}
