import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, BookOpen } from 'lucide-react';
import { API_URL } from '../lib/api';

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        let url = `${API_URL}/blogs`;
        if (selectedCategory) {
          url += `?category=${selectedCategory}`;
        }
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setBlogs(data.blogs);
        }
      } catch (err) {
        console.error('Fetch blogs error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, [selectedCategory]);

  const categories = ['Market Trends', 'Buying Guides', 'Construction'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 page-fade-in text-charcoal">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xxs tracking-[0.25em] font-bold text-primary uppercase">Expert Journalism</span>
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-charcoal mt-1 mb-3">
          DHA Karachi Market Intelligence
        </h1>
        <p className="text-xs text-gray-500 leading-relaxed">
          Stay informed with monthly DHA registry transfer price movements, Phase 8 coastal zoning updates, legal boundaries, and smart off-plan construction timelines in DHA City.
        </p>
      </div>

      {/* Categories Row */}
      <div className="flex flex-wrap justify-center gap-2 mb-10 text-xxs font-bold uppercase tracking-wider">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-2 border transition-all ${!selectedCategory ? 'bg-primary text-white border-primary' : 'border-charcoal/10 text-charcoal hover:border-charcoal'}`}
        >
          All Insights
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 border transition-all ${selectedCategory === cat ? 'bg-primary text-white border-primary' : 'border-charcoal/10 text-charcoal hover:border-charcoal'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Blogs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-white border p-4 space-y-4 animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="h-4 bg-gray-200 w-1/3" />
              <div className="h-6 bg-gray-200 w-3/4" />
            </div>
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-xs font-semibold uppercase">
          No articles matching selected category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.map(blog => (
            <div
              key={blog._id}
              className="group bg-white border border-charcoal/5 shadow-luxury flex flex-col hover:shadow-glass transition-all duration-300"
            >
              {/* Cover Frame */}
              <div className="relative h-52 overflow-hidden">
                <img
                  src={blog.coverImage}
                  alt={blog.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute top-4 left-4 bg-primary text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1">
                  {blog.category}
                </span>
              </div>

              {/* Text Area */}
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-charcoal hover:text-primary transition-colors leading-snug line-clamp-2">
                    <Link to={`/blogs/${blog.slug}`}>{blog.title}</Link>
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-3 mt-3 leading-relaxed">
                    {blog.content}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-charcoal/5 flex items-center justify-between text-xxs font-semibold uppercase tracking-wider">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <User className="w-3.5 h-3.5 text-primary" />
                    <span>By {blog.authorName}</span>
                  </div>
                  <Link
                    to={`/blogs/${blog.slug}`}
                    className="text-primary hover:text-primary-dark flex items-center space-x-1 font-bold"
                  >
                    <span>Read</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
