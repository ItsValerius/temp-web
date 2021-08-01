import "./styles.css";
import { useState, useEffect } from "react";
import { ResponsiveLineCanvas } from "@nivo/line";
import NameInputs from "./NameInputs";

//import { ResponsiveLine } from "@nivo/line";
export default function App() {
  const API_URL = "http://localhost:8000/api";
  const [graphData, setGraphData] = useState([]);
  const [names, setNames] = useState([]);
  const [screenName, setScreenName] = useState("");
  const [text, setText] = useState("");
  const [texts, setTexts] = useState({});
  const [files, setFiles] = useState([]);
  //Call api to get all screen names
  const fetchScreenNames = async () => {
    const res = await fetch(API_URL + "/names");
    const json = await res.json();
    if (json.length > 0) {
      setNames(await json);
      setScreenName(await json[0].name);
    }
  };

  const fetchWeather = async (
    startDate = new Date(),
    endDate = new Date(new Date().setDate(new Date().getDate() + 7))
  ) => {
    const res = await fetch(
      `https://api.brightsky.dev/weather?date=${startDate
        .toISOString()
        .substring(0, 10)}&last_date=${endDate
        .toISOString()
        .substring(0, 10)}&lat=51.3396955&lon=12.3730747`
    );

    const json = await res.json();
    const weatherData = await json.weather.map((weather) => {
      return { y: weather.temperature, x: weather.timestamp };
    });

    const cleanWeatherData = await weatherData.map((data) => {
      return { x: data.x.replace(/T/gm, " ").split("+")[0], y: data.y };
    });
    return { id: "weather", data: cleanWeatherData };
  };

  const fetchAll = async () => {
    fetchScreenNames();
    setGraphData([await fetchWeather()]);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  //Handle file upload

  const formSubmition = (e) => {
    e.preventDefault();
    postFile();
  };

  const postFile = async () => {
    const formData = new FormData();
    Array.from(files).map((file) => {
      formData.append("files[]", file);
    });
    for (let key in texts){
      formData.append("names[]",texts[key])
    }

    // formData.append("name", text);
    // formData.append("file", file);
    const res = await fetch(API_URL + "/fileUpload", {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
    });
  };

  //wait for weather Data and then display the graph

  const removeLine = (e) => {
    e.preventDefault();
    setGraphData(graphData.filter((item) => item.id !== e.target[0].value));
  };

  //Handle Screen Submit

  const handleScreenSubmit = (e) => {
    e.preventDefault();
    getSingleScreen().then((ScreenData) => updateWeather(ScreenData));
  };

  //fetch screen Data from api

  const getSingleScreen = async () => {
    const res = await fetch(API_URL + "/show/one?name=" + screenName);
    const json = await res.json();
    const xyjson = await json.map((row) => {
      return { x: row.timestamp, y: row.temperature };
    });
    return { id: screenName, data: await xyjson };
  };

  //set dates for weather to min and max date of dataset

  const updateWeather = (ScreenData) => {
    let array = [ScreenData, ...graphData];
    let newStartDate = new Date(
      Math.min(
        ...array.map((gd) =>
          Math.min(...gd.data.map((data) => new Date(data.x)))
        )
      )
    );
    let newEndDate = new Date(
      Math.max(
        ...array.map((gd) =>
          Math.max(...gd.data.map((data) => new Date(data.x)))
        )
      )
    );
    fetchWeather(newStartDate, newEndDate).then((w) => {
      if (array.length > 0) {
        array.pop();
      }
      setGraphData([...array, w]);
    });
  };

  //names for screen options
  const OptionNames = () =>
    names.map((name) => {
      return (
        <option key={name.name} value={name.name}>
          {name.name}
        </option>
      );
    });
  //Remove Line from Graph
  const DeleteLine = () => {
    if (Array.isArray(names) && names.length > 0) {
      return (
        <form
          onSubmit={(e) => {
            removeLine(e);
          }}
        >
          <p>Datenlinie entfernen</p>
          <select
            value={screenName}
            onChange={(e) => {
              setScreenName(e.target.value);
            }}
          >
            <OptionNames />
          </select>
          <input type="submit" />
        </form>
      );
    }
    return null;
  };
  //Add Line to Graph
  const AddLine = () => {
    if (Array.isArray(names) && names.length > 0) {
      return (
        <form onSubmit={(e) => handleScreenSubmit(e)}>
          <p>Datenlinie hinzufügen</p>
          <select
            value={screenName}
            onChange={(e) => {
              setScreenName(e.target.value);
            }}
          >
            <OptionNames />
          </select>
          <input type="submit" />
        </form>
      );
    }
    return null;
  };
  //handle change function for name inputs
  const handleChange = (index, value) => {
    setTexts({ ...texts, [index]: value });
  };

  const handleFiles = (e) => {
    setFiles(e.target.files);
    setTexts({
      ...Array.from(e.target.files).map(() => {
        return "";
      }),
    });
  };

  if (graphData.length && Array.isArray(graphData)) {
    return (
      <div className="App">
        <ResponsiveLineCanvas
          data={graphData}
          enablePoints={false}
          xScale={{
            type: "time",
            format: "%Y-%m-%d %H:%M:%S",
            useUTC: false,
            precision: "second",
          }}
          xFormat="time:%Y-%m-%d %H:%M:%S"
          yScale={{
            type: "linear",
            min: "0",
            max: "auto",
            stacked: false,
            reverse: false,
          }}
          margin={{ top: 10, right: 110, bottom: 130, left: 60 }}
          axisBottom={{
            orient: "bottom",
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 45,
            legend: "Datum und Uhrzeit",
            legendOffset: 120,
            legendPosition: "middle",
            format: "%Y-%m-%d %H:%M:%S",
            tickValues: 8,
          }}
          axisLeft={{
            orient: "left",
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Temperatur Leipzig",
            legendOffset: -40,
            legendPosition: "middle",
          }}
          legends={[
            {
              anchor: "bottom-right",
              direction: "column",
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 0,
              itemDirection: "left-to-right",
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: "circle",
              symbolBorderColor: "rgba(0, 0, 0, .5)",
              effects: [
                {
                  on: "hover",
                  style: {
                    itemBackground: "rgba(0, 0, 0, .03)",
                    itemOpacity: 1,
                  },
                },
              ],
            },
          ]}
        />
        {/* Logfile Upload */}
        <form
          onSubmit={(e) => {
            formSubmition(e);
          }}
        >
          <p>Datei hochladen</p>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <NameInputs
            handleChange={handleChange}
            files={files}
            texts={texts}
            key={1}
          />
          <input type="file" name="file" multiple onChange={handleFiles} />
          <input type="submit" value="RPI Temperaturen hinzufügen" />
        </form>
        {/* Remove Line */}
        <DeleteLine />
        {/* Datenlinie hinzufügen */}
        <AddLine />
      </div>
    );
  } else {
    return (
      <div className="App">
        <h1 style={{ display: "grid", justifyItems: "center" }}>Loading...</h1>
      </div>
    );
  }
}
//Responsive Line has worse performance for large datasets using Responsive canvas line instead

//  {<ResponsiveLine
//           data={weather}
//           xScale={{
//             type: "time",
//             format: "%Y-%m-%d %H:%M:%S",
//             useUTC: false,
//             precision: "minute"
//           }}
//           xFormat="time:%Y-%m-%d %H:%M:%S"
//           yScale={{
//             type: "linear",
//             min: "0",
//             max: "auto",
//             stacked: false,
//             reverse: false
//           }}
//           margin={{ top: 10, right: 110, bottom: 130, left: 60 }}
//           axisBottom={{
//             orient: "bottom",
//             tickSize: 5,
//             tickPadding: 5,
//             tickRotation: 45,
//             legend: "Datum und Uhrzeit",
//             legendOffset: 120,
//             legendPosition: "middle",
//             format: "%Y-%m-%d %H:%M:%S",
//             tickValues: 6
//           }}
//           axisLeft={{
//             orient: "left",
//             tickSize: 5,
//             tickPadding: 5,
//             tickRotation: 0,
//             legend: "Temperatur Leipzig",
//             legendOffset: -40,
//             legendPosition: "middle"
//           }}
//           legends={[
//             {
//               anchor: "bottom-right",
//               direction: "column",
//               justify: false,
//               translateX: 100,
//               translateY: 0,
//               itemsSpacing: 0,
//               itemDirection: "left-to-right",
//               itemWidth: 80,
//               itemHeight: 20,
//               itemOpacity: 0.75,
//               symbolSize: 12,
//               symbolShape: "circle",
//               symbolBorderColor: "rgba(0, 0, 0, .5)",
//               effects: [
//                 {
//                   on: "hover",
//                   style: {
//                     itemBackground: "rgba(0, 0, 0, .03)",
//                     itemOpacity: 1
//                   }
//                 }
//               ]
//             }
//           ]}
//         /> }
