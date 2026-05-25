"use client";
import React, { useEffect } from "react";
import { CheckCircle, X } from "lucide-react";

interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  autoClose?: number; // ms — default 3000
}

export const SuccessModal = ({
  isOpen,
  title,
  message,
  onClose,
  autoClose = 3000,
}: Props) => {
  // Auto-close after timeout
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(onClose, autoClose);
    return () => clearTimeout(timer);
  }, [isOpen, autoClose, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-[successIn_0.25s_ease-out]">
        {/* Green top bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-green-400 to-emerald-500" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors border-none bg-transparent cursor-pointer"
        >
          <X size={15} />
        </button>

        {/* Body */}
        <div className="flex flex-col items-center text-center px-8 py-8 gap-4">
          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-green-50 border-4 border-green-100 flex items-center justify-center">
            <CheckCircle size={32} className="text-green-500" />
          </div>

          {/* Text */}
          <div>
            <h3 className="text-lg font-extrabold text-gray-800 mb-1">
              {title}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
            <div
              className="h-full bg-green-400 rounded-full"
              style={{ animation: `shrink ${autoClose}ms linear forwards` }}
            />
          </div>

          {/* Dismiss button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-bold transition-colors border-none cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>

      <style>{`
        @keyframes successIn {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);     }
        }
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%;   }
        }
      `}</style>
    </div>
  );
};
