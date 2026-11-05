import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/sk-image";
import { getMarketplaceCategory } from "@/lib/marketplaceCategories";

const FB = "#1877f2";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const l = await base44.entities.Listing.get(id);
        if (active) setListing(l);
      } catch {
        /* ignore */
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
      </div>
    );
  }
  if (!listing) {
    return (
      <div className="min-h-screen bg-white pb-28">
        <div className="flex items-center gap-2 px-4 pt-6">
          <button onClick={() => navigate("/buy-sell")} className="p-1">
            <ChevronLeft size={24} style={{ color: FB }} />
          </button>
          <span className="font-bold text-gray-900 text-lg">Listing</span>
        </div>
        <p className="px-4 mt-6 text-sm text-gray-400">This listing is no longer available.</p>
      </div>
    );
  }

  const cat = getMarketplaceCategory(listing.category);
  const photos = listing.image_urls && listing.image_urls.length ? listing.image_urls : listing.image_url ? [listing.image_url] : [];

  return (
    <div className="min-h-screen bg-white pb-28">
      <div className="flex items-center gap-2 px-4 pt-6">
        <button onClick={() => navigate("/buy-sell")} className="p-1">
          <ChevronLeft size={24} style={{ color: FB }} />
        </button>
        <span className="font-bold text-gray-900 text-lg truncate">{listing.title}</span>
      </div>

      <div className="px-4 mt-4 space-y-4 max-w-xl">
        {photos.length ? (
          <div className="flex gap-2 overflow-x-auto no-scrollbar rounded-xl">
            {photos.map((u, i) => (
              <span key={i} className="w-64 aspect-square shrink-0 overflow-hidden rounded-xl bg-gray-100">
                <Image src={u} fittingType="fill" className="w-full h-full" />
              </span>
            ))}
          </div>
        ) : (
          <div className="w-full aspect-square rounded-xl bg-gray-100 flex items-center justify-center text-5xl">{cat.emoji}</div>
        )}

        {listing.video_url && (
          <video src={listing.video_url} controls className="w-full rounded-xl max-h-80 bg-black" />
        )}

        <div className="text-2xl font-bold text-gray-900">${Number(listing.price || 0).toFixed(0)}</div>
        <div className="text-sm text-gray-700">
          <span style={{ color: FB }} className="font-medium">{cat.emoji} {cat.label}</span>
          {listing.condition && <span className="text-gray-400"> · {listing.condition.replace("_", " ")}</span>}
        </div>
        {listing.description && <p className="text-sm text-gray-700 whitespace-pre-wrap">{listing.description}</p>}

        {listing.seller_name && (
          <button
            onClick={() => listing.seller_id && navigate(`/profile/${listing.seller_id}`)}
            className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 w-full"
          >
            <span className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold bg-gray-100">
              {listing.seller_avatar ? (
                <Image src={listing.seller_avatar} fittingType="fill" className="w-full h-full" />
              ) : (
                (listing.seller_name || "?").charAt(0)
              )}
            </span>
            <span className="text-sm font-semibold text-gray-900">{listing.seller_name}</span>
          </button>
        )}
      </div>
    </div>
  );
}