import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import {
  Mail,
  CheckCircle,
  Circle,
  MessageSquare,
} from 'lucide-react';

import type { ContactSubmission } from '../types';

export default function Submissions() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] =
    useState<ContactSubmission | null>(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);

      const data = await api.getSubmissions();

      setSubmissions(data);

      if (data.length > 0) {
        setSelectedSubmission(data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const updateStatus = async (
    id: string,
    status: 'read' | 'replied'
  ) => {
    try {
      const updated = await api.updateSubmissionStatus(id, status);

      setSubmissions((prev) =>
        prev.map((s) =>
          s._id === id ? { ...s, status: updated.status } : s
        )
      );

      if (selectedSubmission?._id === id) {
        setSelectedSubmission({
          ...selectedSubmission,
          status: updated.status,
        });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Client Inquiries</h1>

        <p className="text-gray-500 mt-1">
          Manage and respond to contact form submissions
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LIST */}
        <div className="lg:col-span-2 space-y-3">
          {submissions.length === 0 && (
            <div className="bg-dark-300 border border-gray-800 rounded-xl p-8 text-center text-gray-500">
              No submissions found
            </div>
          )}

          {submissions.map((submission) => (
            <div
              key={submission._id}
              onClick={() => setSelectedSubmission(submission)}
              className={`bg-dark-300 rounded-xl p-4 border cursor-pointer transition-all ${
                selectedSubmission?._id === submission._id
                  ? 'border-white'
                  : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">
                      {submission.name}
                    </h3>

                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        submission.status === 'unread'
                          ? 'bg-blue-500/20 text-blue-400'
                          : submission.status === 'replied'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {submission.status}
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm line-clamp-2">
                    {submission.message}
                  </p>

                  <div className="flex gap-4 mt-3 text-xs text-gray-500">
                    <span>{submission.email}</span>

                    <span>{submission.service}</span>

                    <span>
                      {new Date(
                        submission.createdAt
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateStatus(submission._id, 'read');
                    }}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Circle size={14} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateStatus(submission._id, 'replied');
                    }}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <CheckCircle size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DETAILS */}
        <div className="bg-dark-300 rounded-xl border border-gray-800 p-5">
          {selectedSubmission ? (
            <>
              <h3 className="font-semibold text-lg mb-4">
                Inquiry Details
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Name
                  </p>

                  <p className="font-medium">
                    {selectedSubmission.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Email
                  </p>

                  <a
                    href={`mailto:${selectedSubmission.email}`}
                    className="text-blue-400 hover:underline"
                  >
                    {selectedSubmission.email}
                  </a>
                </div>

                {selectedSubmission.phone && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">
                      Phone
                    </p>

                    <p>{selectedSubmission.phone}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Service
                  </p>

                  <p>{selectedSubmission.service}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 mb-1">
                    Message
                  </p>

                  <p className="text-gray-300 leading-relaxed">
                    {selectedSubmission.message}
                  </p>
                </div>

                <div className="pt-4">
                  <a
                    href={`mailto:${selectedSubmission.email}`}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-dark-400 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                  >
                    <Mail size={16} />
                    Reply via Email
                  </a>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <MessageSquare
                size={48}
                className="text-gray-600 mb-3"
              />

              <p className="text-gray-500">
                Select an inquiry to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}