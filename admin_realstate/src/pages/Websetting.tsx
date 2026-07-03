import React, { useEffect, useState } from 'react';
import { Save, Globe } from 'lucide-react';
import { api } from '../api/client';

export default function WebSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    companyName: '',
    companyLogo: '',
    favicon: '',
    aboutTitle: '',
    aboutDescription: '',
    aboutImage: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    seoTitle: '',
    seoDescription: '',
    footerText: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);

      const response = await api.getWebSettings();

      if (response.data) {
        setFormData({
          companyName: response.data.companyName || '',
          companyLogo: response.data.companyLogo || '',
          favicon: response.data.favicon || '',
          aboutTitle: response.data.aboutTitle || '',
          aboutDescription: response.data.aboutDescription || '',
          aboutImage: response.data.aboutImage || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          address: response.data.address || '',
          website: response.data.website || '',
          facebook: response.data.facebook || '',
          instagram: response.data.instagram || '',
          twitter: response.data.twitter || '',
          linkedin: response.data.linkedin || '',
          youtube: response.data.youtube || '',
          seoTitle: response.data.seoTitle || '',
          seoDescription: response.data.seoDescription || '',
          footerText: response.data.footerText || '',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setSuccess('');
      setError('');

      await api.updateWebSettings(formData);

      setSuccess('Web settings updated successfully');
    } catch (err) {
      setError('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-10 h-10 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
            <Globe size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold">Website Settings</h1>
            <p className="text-gray-400">
              Manage your website information and branding
            </p>
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <div className="mb-5 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Company Name */}
            <div>
              <label className="block text-sm mb-2 text-gray-300">
                Company Name
              </label>

              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-dark-100 border border-gray-700 focus:outline-none focus:border-white"
                placeholder="Your Company"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm mb-2 text-gray-300">
                Website URL
              </label>

              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-dark-100 border border-gray-700 focus:outline-none focus:border-white"
                placeholder="https://example.com"
              />
            </div>

            {/* Logo */}
            <div>
              <label className="block text-sm mb-2 text-gray-300">
                Company Logo URL
              </label>

              <input
                type="text"
                name="companyLogo"
                value={formData.companyLogo}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-dark-100 border border-gray-700 focus:outline-none focus:border-white"
                placeholder="https://example.com/logo.png"
              />
            </div>

            {/* Favicon */}
            <div>
              <label className="block text-sm mb-2 text-gray-300">
                Favicon URL
              </label>

              <input
                type="text"
                name="favicon"
                value={formData.favicon}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-dark-100 border border-gray-700 focus:outline-none focus:border-white"
                placeholder="https://example.com/favicon.ico"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm mb-2 text-gray-300">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-dark-100 border border-gray-700 focus:outline-none focus:border-white"
                placeholder="info@example.com"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm mb-2 text-gray-300">
                Phone Number
              </label>

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-dark-100 border border-gray-700 focus:outline-none focus:border-white"
                placeholder="+91 9876543210"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm mb-2 text-gray-300">
              Address
            </label>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-dark-100 border border-gray-700 focus:outline-none focus:border-white"
              placeholder="Company address"
            />
          </div>

          {/* About */}
          <div>
            <label className="block text-sm mb-2 text-gray-300">
              About Title
            </label>

            <input
              type="text"
              name="aboutTitle"
              value={formData.aboutTitle}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-dark-100 border border-gray-700 focus:outline-none focus:border-white mb-4"
              placeholder="About us"
            />

            <textarea
              name="aboutDescription"
              value={formData.aboutDescription}
              onChange={handleChange}
              rows={5}
              className="w-full px-4 py-3 rounded-xl bg-dark-100 border border-gray-700 focus:outline-none focus:border-white"
              placeholder="About company..."
            />
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              'facebook',
              'instagram',
              'twitter',
              'linkedin',
              'youtube',
            ].map((social) => (
              <div key={social}>
                <label className="block text-sm mb-2 text-gray-300 capitalize">
                  {social}
                </label>

                <input
                  type="text"
                  name={social}
                  value={(formData as any)[social]}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-dark-100 border border-gray-700 focus:outline-none focus:border-white"
                  placeholder={`${social} link`}
                />
              </div>
            ))}
          </div>

          {/* SEO */}
          <div>
            <label className="block text-sm mb-2 text-gray-300">
              SEO Title
            </label>

            <input
              type="text"
              name="seoTitle"
              value={formData.seoTitle}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-dark-100 border border-gray-700 focus:outline-none focus:border-white mb-4"
              placeholder="SEO title"
            />

            <textarea
              name="seoDescription"
              value={formData.seoDescription}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 rounded-xl bg-dark-100 border border-gray-700 focus:outline-none focus:border-white"
              placeholder="SEO description"
            />
          </div>

          {/* Footer */}
          <div>
            <label className="block text-sm mb-2 text-gray-300">
              Footer Text
            </label>

            <input
              type="text"
              name="footerText"
              value={formData.footerText}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl bg-dark-100 border border-gray-700 focus:outline-none focus:border-white"
              placeholder="© 2026 Your Company"
            />
          </div>

          {/* Save */}
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-white text-dark-400 font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-dark-400 border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Settings
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}