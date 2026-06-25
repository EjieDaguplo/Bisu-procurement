"use client";
import React from "react";
import { MapPin, Clock, Star, Phone } from "lucide-react";

const BISU_BILAR = {
  name: "Bohol Island State University – Bilar Campus",
  address: "P495+6RF, Bilar, Bohol, Philippines",
  latitude: 9.7180667,
  longitude: 124.1095558,
  rating: 4.2,
  phone: "+63 38 535 9022",
};

export const CampusMap = () => {
  const mapEmbedUrl = `https://www.google.com/maps?q=${BISU_BILAR.latitude},${BISU_BILAR.longitude}&z=16&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${BISU_BILAR.latitude},${BISU_BILAR.longitude}`;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-bisu-blue/10 flex items-center justify-center">
            <MapPin size={16} className="text-bisu-blue" />
          </div>
          <h3 className="font-bold text-bisu-blue text-base m-0">
            Campus Location
          </h3>
        </div>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-bisu-blue hover:text-bisu-blue-dark transition-colors no-underline"
        >
          Get Directions →
        </a>
      </div>

      {/* Map embed */}
      <div className="relative w-full h-64">
        <iframe
          src={mapEmbedUrl}
          width="100%"
          height="100%"
          className="border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="BISU Bilar Campus Map"
        />
      </div>

      {/* Info footer */}
      <div className="px-6 py-4 flex flex-col gap-2.5">
        <div>
          <p className="font-semibold text-gray-800 text-sm m-0">
            {BISU_BILAR.name}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{BISU_BILAR.address}</p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Star size={13} className="text-bisu-yellow fill-bisu-yellow" />
            <span className="text-xs font-medium text-gray-600">
              {BISU_BILAR.rating} rating
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone size={13} className="text-gray-400" />
            <a
              href={`tel:${BISU_BILAR.phone}`}
              className="text-xs font-medium text-gray-600 no-underline hover:text-bisu-blue"
            >
              {BISU_BILAR.phone}
            </a>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={13} className="text-gray-400" />
            <span className="text-xs font-medium text-gray-600">
              Mon–Fri 9AM–7PM
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
