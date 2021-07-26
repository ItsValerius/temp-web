import "./styles.css";
import { useState, useEffect } from "react";
import { ResponsiveLineCanvas } from "@nivo/line";
//import { ResponsiveLine } from "@nivo/line";
export default function App() {

const API_URL = "http://localhost:8000/api";

  const [weather, setWeather] = useState([]);
  const [textarea, setTextarea] = useState();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(
    new Date(new Date().setDate(new Date().getDate() + 7))
  );
  const [names,setNames] = useState([]);
  const [screenName,setScreenName] = useState("");

  const [index, setIndex] = useState(0);

  //Go through the input split by newline and comma remove last if empty
  const parseInput = () => {
    if (textarea) {
      let ArrayTextarea = textarea.split("\n");

      ArrayTextarea = ArrayTextarea.map((at) => {
        return at.split(",");
      });

      const parsedInput = ArrayTextarea.map((at) => {
        return { y: at[0], x: at[2] };
      });

      if (parsedInput[parsedInput.length - 1].y === "") {
        parsedInput.pop();
        return parsedInput;
      }
      return parsedInput;
    }
  };

  //clean up input data prepare for graph

  const cleanData = (rpiData) => {
    if (rpiData) {
      const splitData = rpiData.map((data) => {
        return { x: data.x.split(".")[0], y: data.y };
      });
      const cleanedData = { id: `rpi-leipzig-${index}`, data: splitData };
      setIndex(index + 1);
      return cleanedData;
    }
  };

  const fetchScreenNames = async () => {
    const res = await fetch(API_URL + "/names");
    const json = await res.json();
    setNames(await json);
    setScreenName(await json[0].name);
  }


useEffect(() => {
  fetchScreenNames();

},[])

  //call weather api and clean up the data

  useEffect(() => {
    const fetchWeather = async () => {
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

      return (  [{ id: "leipzig", data: cleanWeatherData }]);
    };
    if(weather.length === 0)
    console.log( [fetchWeather()]);
     {fetchWeather().then(w => setWeather(w))}

     //still need to fix this
if(Array.isArray(weather) && weather.length > 0)
   { fetchWeather().then(w => { setWeather([...w,...weather.shift()])})
}
    
  }, [startDate, endDate]);


  const formSubmition = (e) => {
    e.preventDefault();
    setWeather([...weather, cleanedData]);
  };

  //wait for weather Data and then display the graph

  const removeLine = () => {
    if (weather.length > 1)
      setWeather(weather.filter((item) => item.id !== weather.pop().id));
  };

  //Handle Screen Submit

  const handleScreenSubmit = (e) => {
    e.preventDefault();
    getSingleScreen();
  }

  const getSingleScreen = async () => 
  {
    const url = API_URL + "/show/one?name="+screenName;
    console.log(url);
    const res = await fetch(API_URL + "/show/one?name="+screenName);
    const json = await res.json();
    console.log(await json);
   const xyjson = json.map((row) => {
    return {x: row.timestamp,y:row.temperature};
    })
    const screenData = {id:screenName,data:xyjson};

      setWeather([...weather, screenData]);
  }

  if (weather.length&&Array.isArray(weather) && names.length&&Array.isArray(names)) {   
  console.log(weather);
    return (
      <div className="App">
        <ResponsiveLineCanvas
          data={weather}
          enablePoints={false}
          xScale={{
            type: "time",
            format: "%Y-%m-%d %H:%M:%S",
            useUTC: false,
            precision: "second"
          }}
          xFormat="time:%Y-%m-%d %H:%M:%S"
          yScale={{
            type: "linear",
            min: "0",
            max: "auto",
            stacked: false,
            reverse: false
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
            tickValues: 8
          }}
          axisLeft={{
            orient: "left",
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: "Temperatur Leipzig",
            legendOffset: -40,
            legendPosition: "middle"
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
                    itemOpacity: 1
                  }
                }
              ]
            }
          ]}
        />
        <form
          onSubmit={(e) => {
            formSubmition(e);
          }}
        >
          <p>Datei hochladen</p>
          <input type="file" name="file" />
          <input type="submit" value="RPI Temperaturen hinzufügen" />
        </form>
        <p>Datenlinie entfernen</p>
        <button
          onClick={() => {
            removeLine();
          }}
        >
          remove
        </button>
        <form onSubmit={(e) => {e.preventDefault(); setStartDate(new Date (e.target[0].value));setEndDate(new Date (e.target[1].value))}}>
          <p>Zeitraum</p>
          <input
            type="date"
             defaultValue={startDate.toISOString().substring(0,10)}
            // value={startDate}
            // onChange={(e) => {
            //   setStartDate(new Date(e.target.value));
            // }}
          />
          <input
            type="date"
            
             defaultValue={endDate.toISOString().substring(0,10)}
            // value={endDate}
            // onChange={(e) => {
            //   setEndDate(new Date(e.target.value));
            // }}
          />
          <input type="submit" />
        </form>
        <form onSubmit={(e) => handleScreenSubmit(e)} >
          <select value={screenName} onChange={(e) => {setScreenName(e.target.value)}}>
            {names.map((name) => {return (<option key={name.name} value={name.name}>{name.name}</option>)})}
          </select>
          <input type="submit"/>
        </form>
      </div>
      
    );
  } else {
    return (
      <div className="App">
      <h1 style={{ display: "grid", justifyItems: "center" }}> Loading... </h1>
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
