const API = import.meta.env.VITE_API_URL;
import axios from "axios";

export const getTestimonials = async () => {
  const res = await axios.get(`${API}/feedback/testimonials`);
  return res.data.data;
};