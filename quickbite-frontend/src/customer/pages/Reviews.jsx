import { useState } from "react";

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);

  const addReview = () => {
    if (!text) return;
    setReviews([
      ...reviews,
      { id: Date.now(), text, rating }
    ]);
    setText("");
  };

  const deleteReview = (id) => {
    setReviews(reviews.filter(r => r.id !== id));
  };

  const editReview = (id) => {
    const newText = prompt("Edit review:");
    if (!newText) return;
    setReviews(reviews.map(r =>
      r.id === id ? { ...r, text: newText } : r
    ));
  };

  return (
    <div className="p-4 max-w-xl mx-auto">

      <h2 className="text-xl font-bold mb-4">Reviews & Ratings</h2>

      {/* ADD */}
      <div className="mb-4">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write review"
          className="border p-2 w-full mb-2 rounded"
        />

        <select value={rating} onChange={(e) => setRating(e.target.value)}>
          {[1,2,3,4,5].map(r => <option key={r}>{r}</option>)}
        </select>

        <button onClick={addReview} className="bg-orange-500 text-white px-3 py-1 rounded ml-2">
          Submit
        </button>
      </div>

      {/* LIST */}
      {reviews.map(r => (
        <div key={r.id} className="bg-white p-3 mb-2 rounded shadow">

          <p>⭐ {r.rating}</p>
          <p>{r.text}</p>

          <div className="flex gap-2 mt-2">
            <button onClick={() => editReview(r.id)}>Edit</button>
            <button onClick={() => deleteReview(r.id)}>Delete</button>
          </div>

        </div>
      ))}

    </div>
  );
}

export default Reviews;