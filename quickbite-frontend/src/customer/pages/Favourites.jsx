function Favourites({ favourites, setPage, setSelectedRestaurant }) {
  if (favourites.length === 0) {
    return <p className="p-6">No favourites yet ❤️</p>;
  }

  return (
    <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
      {favourites.map((res) => (
        <div
          key={res.id}
          onClick={() => {
            setSelectedRestaurant(res);
            setPage("restaurant");
          }}
          className="bg-white p-4 rounded-xl shadow cursor-pointer"
        >
          <img src={res.image} className="h-32 w-full object-cover rounded" />
          <h3 className="mt-2 font-semibold">{res.name}</h3>
        </div>
      ))}
    </div>
  );
}
export default Favourites;