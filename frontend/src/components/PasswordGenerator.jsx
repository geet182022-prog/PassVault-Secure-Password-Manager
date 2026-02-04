import { useState } from "react";
import { generatePassword } from "../utils/passwordGenerator";

const PasswordGenerator = ({ onGenerate }) => {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    upper: true,
    lower: true,
    numbers: true,
    symbols: true,
  });

  const handleGenerate = () => {
    const pwd = generatePassword({ length, ...options });
    onGenerate(pwd);
  };

  return (
    <div className="bg-black/30 px-3 py-2 rounded-md  text-sm text-white">
      <div className="flex items-center justify-between gap-2 text-w">
        <label>Length: {length}</label>
        <input
          type="range"
          min="8"
          max="32"
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        {Object.keys(options).map((key) => (
          <label key={key} className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={options[key]}
              onChange={() =>
                setOptions({ ...options, [key]: !options[key] })
              }
            />
            {key}
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        className="mt-3 w-full bg-purple-600 hover:bg-purple-700 rounded p-1"
      >
        Generate 🔁
      </button>
    </div>
  );
};

export default PasswordGenerator;
