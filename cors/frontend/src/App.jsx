import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
function App() {
  const [data, setData] = useState([]);
  useEffect(() => {
    axios
      .get("/api/quotes")
      .then((response) => {
        console.log(response);
        setData(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  return (
    <div>
      <h1>Backend preparation</h1>

      {data.map((elem) => (
        <div key={elem.id}>{elem.text}</div>
      ))}
    </div>
  );
}

export default App;
