import React from 'react';
import GitHubIcon from '@mui/icons-material/GitHub';
import Button from '@mui/material/Button';
import {useEffect, useState,  useRef} from "react";
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import Chartsss from './Chart'
import {BrowserRouter as Router, Routes, Route,Switch,useNavigate} from "react-router-dom";
import AccountCircle from '@mui/icons-material/AccountCircle';
import format from 'date-fns/format'
import { addDays, subDays } from 'date-fns';
import { DateRange } from 'react-date-range';

const MainUI =(props)=>{
    const [rerender, setRerender] = useState(false);
    const [range, setRange] = useState([
        {
          startDate: new Date(),
          endDate: subDays(new Date(), 15),
          key: 'selection'
        }
      ]);
      const [open, setOpen] = useState(false);
      const refOne = useRef(null);
    const navigate =useNavigate();
    return(
        <>

<>
{localStorage.getItem("access_token") ? (
        <><div className="mainPage">

          <div className="nav">
            <Button startIcon={<AccountTreeOutlinedIcon />} style={{
              color: "white",
              padding: 10, borderRadius: 15, fontFamily: "sans-serif",
              marginRight: "400px", fontSize: 16, fontWeight: 600
            }}>
              GIT VIEW
            </Button>
            <input type="file" accept=".xlsx, .xls, .xlsm, .csv" onChange={props.handleFileUpload} />
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
              WELCOME {props.userData.login}
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
            <button id="repoButton" onClick={props.getUserRepos} style={{


            }}>GET REPOSITORIES</button>
            {
              Object.keys(props.repositories).length !== 0 ? (
                <>
                  <select id="repoDropdown" onChange={props.handleRepoDropdownChange}> {
                    Object.entries(props.repositories).map(([key, value]) => (
                      <option key={key} value={value}> {value} </option>))
                  }
                  </select>
                  <select style={{ marginLeft: 10 }} id="contributorDropdown" value={props.selectedContributor} onChange={props.handleContributorDropdownChange}>
                    <option value="">--Please choose a Contributor--</option>
                    <option value="all">All contributors</option>
                    {
                      props.contributors.map((option, index) => (
                        <option key={index} value={option}> {option} </option>
                      ))
                    }
                  </select>

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
            }<button id="chartButton" onClick={()=>navigate('charts')}>Charts</button>
          
          </div>
          
          
          
        </div> </>// main page end 
        
      ) : (
        <>
          <div className="card">
            <h1 style={{ color: "white", fontFamily: "sans-serif" }}>LOGIN TO BEGIN GRADING</h1>
            <Button onClick={props.loginWithGithub} variant="outlined" startIcon={<GitHubIcon />} style={{
              color: "white",
              padding: 10, borderRadius: 15, fontFamily: "sans-serif"
            }}>
              SIGN IN WITH GITHUB
            </Button>
          </div>
        </>
      )}</>
        
        </>
    )
}

export default MainUI;