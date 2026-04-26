import { useState } from "react";

function Navbar() {
  const [vegOnly, setVegOnly] = useState(false);

  return (
    <div className="bg-[#2b0a03] text-white p-4 flex flex-col gap-3">

      {/* TOP ROW */}
      <div className="flex justify-between items-center">

       

        <div className="flex items-center gap-4">


        </div>

      </div>

      {/* SEARCH ONLY (CLEAN UI) */}
      <input
        type="text"
        placeholder="Search for food, restaurants..."
        className="px-4 py-3 rounded-xl text-black w-full"
      />

    </div>
  );
}

export default Navbar;