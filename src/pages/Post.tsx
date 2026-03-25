
import React, { useState, useRef } from "react";

const Post: React.FC = () => {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would send the post data to your backend
    setSuccess(true);
    setCaption("");
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-4 py-8">
      <div className="w-full max-w-md bg-cocoa-950 rounded-2xl shadow-lg p-8 border border-white/10">
        <h1 className="text-2xl font-bold mb-6 text-center">Create a Post</h1>
        {success && (
          <div className="mb-4 p-3 rounded bg-green-700/20 text-green-300 text-center">Post created successfully!</div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white placeholder-cream-100/40 focus:outline-none focus:border-cyan-400 min-h-[80px]"
            placeholder="What's on your mind?"
            value={caption}
            onChange={e => setCaption(e.target.value)}
            required
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="block w-full text-sm text-cream-100 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
          />
          {preview && (
            <img src={preview} alt="Preview" className="w-full max-h-60 object-contain rounded-lg border border-white/10" />
          )}
          <button
            type="submit"
            className="mt-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-60"
            disabled={!caption.trim()}
          >
            Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default Post;
