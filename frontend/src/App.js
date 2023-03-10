import "./App.css";
import "./components/LoginButton.css";
import { useEffect, useState,  useRef} from "react";
import { BrowserRouter as Router, Routes, Route ,Navigate} from "react-router-dom";
import { AboutUs } from "./pages/AboutUs";
import * as XLSX from 'xlsx';
import { addDays, subDays } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import Home from "./components/Chart";
import MainUI from "./components/MainUI.js";

const CLIENT_ID = "e7231ef0e449bce7d695";
function App() {
  const [rerender, setRerender] = useState(false);
  const [userData, setUserData] = useState({});
  const [repositories, setRepositories] = useState([]);
  const [contributors, setContributors] = useState([]);
    const [commits, setCommits] = useState([]);
    const [PRs, setPRs] = useState([]);
  const [text, setText] = useState();
  const [repos, setRepos] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState("");
  const [selectedContributor, setSelectedContributor] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [excelData, setExcelData] = useState([]);
  const [date, setDate] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      key: 'selection'
    }
  ]);
  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: subDays(new Date(), 15),
      key: 'selection'
    }
  ]);
  const [open, setOpen] = useState(false);
  // const [value, setValue] = useState(["2000/02/03", null]);
  // const [value, setValue] = React.useState<DateRangePickerDay>([null, null]);


  const refOne = useRef(null);


  // Forward the user to the github login screen (pass clientID)
  // user is now on the github side ang logs in
  // when user decides to login .. they get forwaded back to localhost
  // get code
  // use code to get access token ( code can be only used once)
  useEffect(() => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const codeParam = urlParams.get("code");
    // using local storage to store access_token, help persists through login in with Github
    if (codeParam && localStorage.getItem("access_token") === null) {
      async function getAccessToken() {
        await fetch("http://localhost:9000/getAccessToken?code=" + codeParam, { method: "GET" }).then((response) => {
          return response.json();
        }).then((data) => {
          if (data.access_token) {
            localStorage.setItem("access_token", data.access_token);
            getUserData();
            setRerender(!rerender); // to force rerender on success
          }
        });
      }
      getAccessToken();
    }
  }, []); // [] is used to run once

  function loginWithGithub() {
    const scope = "repo,user";
    window.location.assign(`https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=${scope}`);
  }

  async function getUserData() {
    await fetch("http://localhost:9000/getUserData", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("access_token")
      }
    }).then((response) => {
      return response.json();
    }).then((data) => {
      setUserData(data);
    });
  }

  async function getUserRepos() {
    await fetch("http://localhost:9000/getUserRepos", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("access_token")
      }
    }).then((response) => {
      return response.json();
    }).then((data) => {
      let commonElements = new Map();
      Object.keys(data).forEach(key => {
        if (excelData.includes(data[key])) {
          commonElements[key] = data[key];
        }
      });
      setRepositories(commonElements);
    });
  }

  async function getRepoContributors(selectedValue) {
    console.log("Repo: " + selectedValue);
    await fetch("http://localhost:9000/getRepoContributors?repo=" + selectedValue, {
      method: "GET",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("access_token")
      }
    }).then((response) => {
      return response.json();
    }).then((data) => {
            console.log(data)
      setContributors(data);
    });
  }

    async function getCommits(){
        console.log("The selected repo is => " + selectedRepo);
        console.log("The selected user is => " + selectedContributor);

        if (selectedContributor == "all") {
            await fetch("http://localhost:9000/getCommits?repo=" + selectedRepo, {
                method: "GET",
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("access_token")
                }
            }).then((response) => {
                return response.json();
            }).then((data) => {
                console.log(data)
                setCommits(data);
            });
        }

        else if (selectedContributor == null ) {
            await fetch("http://localhost:9000/getCommits?repo=" + selectedRepo, {
                method: "GET",
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("access_token")
                }
            }).then((response) => {
                return response.json();
            }).then((data) => {
                console.log(data)
                setCommits(data);
            });
        }
        else if (selectedContributor != "all"){
            await fetch("http://localhost:9000/getCommits?repo=" + selectedRepo + "&author=" + selectedContributor, {
                method: "GET",
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("access_token")
                }
            }).then((response) => {
                return response.json();
            }).then((data) => {
                console.log("after fetch is made, selected contributor and selected repo is:" + selectedContributor + selectedRepo);
                console.log(data);
                setCommits(data);
            });
        }
       
    }

    async function getPRs(){
        console.log("getting PRs for this repo => " + selectedRepo);
        console.log(selectedContributor)

        if (selectedContributor == "all") {
            await fetch("http://localhost:9000/getPRs?repo=" + selectedRepo, {
                method: "GET",
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("access_token")
                }
            }).then((response) => {
                return response.json();
            }).then((data) => {
                console.log(data)
                setCommits(data);
            });
        }

        else if (selectedContributor == null ) {
            await fetch("http://localhost:9000/getPRs?repo=" + selectedRepo, {
                method: "GET",
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("access_token")
                }
            }).then((response) => {
                return response.json();
            }).then((data) => {
                console.log(data)
                setCommits(data);
            });
        }
        else if (selectedContributor != "all"){
            await fetch("http://localhost:9000/getPRs?repo=" + selectedRepo + "&creator=" + selectedContributor, {
                method: "GET",
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("access_token")
                }
            }).then((response) => {
                return response.json();
            }).then((data) => {
                console.log("after fetch is made, selected contributor and selected repo is:" + selectedContributor + selectedRepo);
                console.log(data);
                setCommits(data);
            });
        }

    }

  function handleSearch(event) {
    setSearchTerm(event.target.value);
  }

  function handleRepoDropdownChange(event) {
    setSelectedRepo(event.target.value);
    getRepoContributors(event.target.value);
  }

  function handleContributorDropdownChange(event) {
    setSelectedContributor(event.target.value);
  }

  function handleFileUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const list = [];
      for (let z in worksheet) {
        if (z.toString()[0] === 'A') {
          list.push(worksheet[z].v);
        }
      }
      setExcelData(list);
    };
    reader.readAsArrayBuffer(file);
  }

  useEffect(() => {
    // event listeners
    document.addEventListener("keydown", hideOnEscape, true)
    document.addEventListener("click", hideOnClickOutside, true)
  }, [])

  const hideOnEscape = (e) => {
    // console.log(e.key)
    if (e.key === "Escape") {
      setOpen(false)
    }
  }

  const hideOnClickOutside = (e) => {
    // console.log(refOne.current)
    // console.log(e.target)
    if (refOne.current && !refOne.current.contains(e.target)) {
      setOpen(false)
    }
  }

  const filteredRepos = repos.filter((repo) => repo.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // useEffect(() => {
  //     async function fetchRepos() {
  //         await fetch("http://localhost:9000/getUserRepos", {
  //             method: "GET",
  //             headers: {
  //                 Authorization: "Bearer " + localStorage.getItem("access_token")
  //             }
  //         }).then((response) => {
  //             return response.json();
  //         })
  //         setRepos(repos);
  //     }
  //     fetchRepos();
  // }, []);

  return (

    <div className="App">
      <Router>
        <Routes>
        <Route  path="/home/Charts" element={<Home />} />
        <Route  path="/Home" element={
        <MainUI loginWithGithub={loginWithGithub}
         data={userData} handleFileUpload={handleFileUpload} userData={userData} 
         getUserRepos={getUserRepos} repositories={repositories} 
         handleRepoDropdownChange={handleRepoDropdownChange} 
         selectedContributor={selectedContributor} 
         handleContributorDropdownChange={handleContributorDropdownChange} contributors={contributors}/>}/>
        <Route path="/" element={<Navigate to="/Home" replace={true} />}></Route>
          <Route path='/about-us' element={<AboutUs />} />
        </Routes>
      </Router>
      {/*
      {/* <header className="App-header"> */}
      {localStorage.getItem("access_token") ? (
        <div className="mainPage">

          <div className="nav">
            <Button startIcon={<AccountTreeOutlinedIcon />} style={{
              color: "white",
              padding: 10, borderRadius: 15, fontFamily: "sans-serif",
              marginRight: "400px", fontSize: 16, fontWeight: 600
            }}>
              GIT VIEW
            </Button>
            <input type="file" accept=".xlsx, .xls, .xlsm, .csv" onChange={handleFileUpload} />
            <button
              onClick={() => {
                localStorage.removeItem("access_token");
                setRerender(!rerender);
              }}
              style={{
                color: "white", backgroundColor: 'black',
                fontFamily: "sans-serif", fontSize: 16

              }}
            >
              Log Out
            </button>
            <Button startIcon={<AccountCircle />} style={{
              color: "white",
              padding: 10, borderRadius: 15, fontFamily: "sans-serif",
              justifyContent: "flex-end"
            }}>
              WELCOME {userData.login}
            </Button>

          </div>

          <div className="tableFilter">
            {/* <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="demo-simple-select-helper-label">Choose Repo</InputLabel>
                {
                  Object.keys(repositories).length !== 0 ? (
                    <>
                      <Select
                        labelId="demo-simple-select-helper-label"
                        id="demo-simple-select-helper"
                        // value={age}
                        label="Repository List"
                        onChange={handleDropdownChange}
                      >
                        {
                          Object.entries(repositories).map(([key, value]) => (
                            <option key={key} value={value}> {value} </option>))
                        }
                      </Select>
  
  
                    </>
                  ) : (<> </>)
                }
                <MenuItem value={"all"}>
              <em>{"all"}</em>
                </MenuItem> 
                 <MenuItem value={10}>Ten</MenuItem>
                <MenuItem value={20}>Twenty</MenuItem>
                <MenuItem value={30}>Thirty</MenuItem>
  
                <FormHelperText>Please select a Contributor</FormHelperText>
              </FormControl> */}
            <button id="repoButton" onClick={getUserRepos} style={{


            }}>GET REPOSITORIES</button>
            {
              Object.keys(repositories).length !== 0 ? (
                <>
                  <select id="repoDropdown" onChange={handleRepoDropdownChange}> {
                    Object.entries(repositories).map(([key, value]) => (
                      <option key={key} value={value}> {value} </option>))
                  }
                  </select>
                  <select style={{ marginLeft: 10 }} id="contributorDropdown" value={selectedContributor} onChange={handleContributorDropdownChange}>
                    <option value="">--Please choose a Contributor--</option>
                    <option value="all">All contributors</option>
                    {
                      contributors.map((option, index) => (
                        <option key={index} value={option}> {option} </option>
                      ))
                    }
                  </select>
                  <button onClick={getCommits}>Get Commits</button>
                  <button onClick={getPRs}> Get PRs</button>

                  <div className="calendarWrap">

                    <input
                      value={`${format(range[0].startDate, "MM/dd/yy")} to ${format(range[0].endDate, "MM/dd/yy")}`}
                      readOnly
                      className="inputBox"
                      onClick={() => setOpen(open => !open)}
                    />

                    <div ref={refOne}>
                      {open &&
                        <DateRange
                          onChange={item => setRange([item.selection])}
                          editableDateInputs={true}
                          moveRangeOnFirstSelection={false}
                          ranges={range}
                          months={1}
                          direction="horizontal"
                          className="calendarElement"
                        />
                      }
                    </div>

                  </div>

                </>
              ) : (<> </>)
            }
          </div>

        </div> // main page end
      ) : (
        <>
          <div className="card">
            <h1 style={{ color: "white", fontFamily: "sans-serif" }}>LOGIN TO BEGIN GRADING</h1>
            <Button onClick={loginWithGithub} variant="outlined" startIcon={<GitHubIcon />} style={{
              color: "white",
              padding: 10, borderRadius: 15, fontFamily: "sans-serif"
            }}>
              SIGN IN WITH GITHUB
            </Button>
          </div>
        </>
      )}

      {/* </header> */}
    </div>
  );
}


export default App;
