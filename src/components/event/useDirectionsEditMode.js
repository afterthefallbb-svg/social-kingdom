import { useEffect, useState } from "react";

export default function useDirectionsEditMode() {
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const update = () => setIsEditing(root.hasAttribute("data-visual-edit-active"));
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["data-visual-edit-active"] });
    update();
    return () => observer.disconnect();
  }, []);
  return isEditing;
}