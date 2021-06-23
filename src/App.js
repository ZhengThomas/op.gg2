import React from 'react';
import './App.css';
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css';

import Accordion from 'react-bootstrap/Accordion';
import Image from "react-bootstrap/Image";

import { Container, Row, Col } from 'react-bootstrap';

import { useAccordionToggle } from 'react-bootstrap/AccordionToggle';

import findSumm from "./dragon/findSummSpell"
import findChamp from "./dragon/findChampion"



//big note on how i made my shit
//a lot of my css styling on divs and shit use the style = {{gay}} element
//this make it incredibly hard to read, but i did this since i would need like 80 different classes in order to fit all of the shit i want
//you could porbably just try your best to ignore the style element shit and you would understand the code perfectly




function CustomToggle({ children, eventKey, winLose }) {
  const decoratedOnClick = useAccordionToggle(eventKey
  );

  return (
    <button
    type="button"
    //style={{backgroundColor: 'pink', width : '100%', marginBottom:"0px"}}
    className = {"gameInfoAccordion " + winLose}
    onClick={decoratedOnClick}
    >
    {children}
    </button>

    
  );
}


export class App extends React.Component {

  constructor(props){
    super(props);

    this.state = {
        matches : [[],[],[],[],[]],
        upperAccordion: [[],[],[],[],[]],
        winLoseGame: [false,false,false,false,false],
        puuid : "",
        encryptedId : "",
        summonerName:"",
        summonerLevel:"",
        summonerProfile : 0,

        rankedSoloInfo:{rank:"unranked", lp:0, tier : "unranked"},
        rankedFlexInfo:{rank:"unranked", lp:0, tier : "unranked"},

        gamesWon : 0,
        totalKills : 0,
        totalDeaths : 0,
        totalAssists : 0,

        favRole: [],
        favChamp: [],

        matchesFound : 0
    }
  }

  async componentDidMount(){
    
    let personToSearch = this.props.match.params.username
    
    //sets puuid for later use, as well as other states to be able to render player data
    await axios.post("http://localhost:3000/joker/baby", {"url": "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + personToSearch})
    .then(res => {
        
        
        this.setState({
          puuid : res.data.puuid,
          encryptedId : res.data.id,

          summonerName : res.data.name,
          summonerLevel : res.data.summonerLevel,
          summonerProfile : res.data.profileIconId.toString(),

          masteryData : []
        });

          
      })
    .catch(err => {
      console.log("suck my fat cock");
      window.location.assign("/notFound");
    })

    await axios.post("http://localhost:3000/joker/baby", {"url": "https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/" +  this.state.encryptedId})
      .then(res => {

        let rankedSolo = {rank : "unranked", lp : 0, tier : "unranked"};
        let rankedFlex = {rank : "unranked", lp : 0, tier : "unranked"};

        res.data.forEach(rankData => {
          if(rankData.queueType == "RANKED_FLEX_SR"){
            rankedFlex = {
              rank : rankData.rank,
              tier : rankData.tier,
              lp : rankData.leaguePoints
            }
          }

          else if(rankData.queueType == "RANKED_SOLO_5x5"){
            rankedSolo = {
              rank : rankData.rank,
              tier : rankData.tier,
              lp : rankData.leaguePoints
            }
          }
        });

        this.setState({
          rankedSoloInfo : rankedSolo,
          rankedFlexInfo : rankedFlex
        });
        
      });
    


    //currently gets 10 games, can change later
    //get games, then run through a game and set some states based on the info in the game
    await axios.post("http://localhost:3000/joker/baby", {"url": "https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/" + this.state.puuid + "/ids?start=0&count=10"})
      .then(res => {
        this.setState({matchesFound:res.data.length});
        for(let i = 0; i < (this.state.matchesFound); i++){
          axios.post("http://localhost:3000/joker/baby", {"url": "https://americas.api.riotgames.com/lol/match/v5/matches/" + res.data[i]})
            .then(res => {

              console.log(res.data);
              let team1 = [];
              let team2 = [];

              let team1Won = false;
              if(res.data.info.teams[0].win) team1Won = true;

              for(let i = 0; i < 10; i++){

                let currentChamp = res.data.info.participants[i].championName
                let currentSumm = res.data.info.participants[i].summonerName
                let participants = res.data.info.participants

                let shitToPutIn = [
                <div style = {{"width" : "2%"}} />,


                <div style = {{"width" : "10%", "display": "flex", alignItems:"center"}}>
                  {/*champion pngs*/}
                  <Image src={`../images/champion/${currentChamp}.png`} alt = "champion" className = "championImage" roundedCircle/>

                  <div className = "summonerSpellContainer">
                    {/*summoner spell pngs*/}
                    <Image src ={`../images/spell/${findSumm(participants[i].summoner1Id).image.full}`} className = "summonerSpellImage" />
                    <Image src ={`../images/spell/${findSumm(participants[i].summoner2Id).image.full}`} className = "summonerSpellImage" />
                  </div>

                </div>,

                <div style = {{"width" : "25%", "justifyContent" : "left"}} className = "gameInfoTextBox">
                  <h1>{currentSumm}</h1>
                </div>,

                <div style = {{"width" : "14%"}} className = "gameInfoTextBox">
                  <h1>{participants[i].kills + "/" + participants[i].deaths + "/" + participants[i].assists}</h1>
                </div>,

                <div style = {{"width" : "14%"}} className = "gameInfoTextBox">
                  <h1>{participants[i].totalDamageDealtToChampions}</h1>
                </div>,

                <div style = {{"width" : "14%"}} className = "gameInfoTextBox">
                  <h1>{participants[i].totalMinionsKilled}</h1>
                </div>,

                <div style = {{"width" : "20%"}} className = "gameInfoTextBox">
                  {

                  //this shit is imossible to read
                  //basically loops through the current players items using map function
                  //if the item is 0, then uses a div to imitate a unused item slot

                  [...Array(7)].map((value, index) => {
                    let currentItem = participants[i]["item" + index.toString()]

                    if(currentItem == "0") return (<img src={`../images/item/emptyItemSlot.png`} className = "normalItem"/>);
                    else return(<img src={`../images/item/${participants[i]["item" + index.toString()]}.png`} className = "normalItem"/>);
                  })}

                </div>]

                if(i < 5){
                  team1.push(
                    <div className = "flexBoxLmao">
                      {shitToPutIn}
                    </div>)
                }
                else{
                  team2.push(
                    <div className = "flexBoxLmao">
                      {shitToPutIn}
                    </div>)
                }
              }
              
              let topMostRow = [
                <div style ={{"width" : "14%"}} className = "gameInfoTextBox">
                  <h2>K/D/A</h2>
                </div>,

                <div style ={{"width" : "14%"}} className = "gameInfoTextBox">
                  <h2>Damage</h2>
                </div>,

                <div style ={{"width" : "14%"}} className = "gameInfoTextBox">
                  <h2>CS</h2>
                </div>,

                <div style ={{"width" : "20%"}} className = "gameInfoTextBox">
                  <h2>Items</h2>
                </div>]



              let temp = [
                <div>
                  <div className = {team1Won ? "winningTeam" : "losingTeam"}>

                    <div className = "topOfInfo">
                      <div style = {{"width" : "7.5%"}} className = "gameInfoTextBox" >
                        <h1 className = {team1Won ? "blueTextWinner" : "redTextLoser"}>{team1Won ? "Win" : "Loss"}</h1>
                      </div>

                      <div style = {{"width" : "4.5%"}} />

                      <div style = {{"width" : "25%", "justifyContent":"left"}} className = "gameInfoTextBox">
                        <h1>Blue Team</h1>
                      </div>

                      {topMostRow}

                    </div>

                    {team1}
                  </div>



                  
                  <div className = {team1Won ? "losingTeam" : "winningTeam"}>

                    <div className = "topOfInfo">

                      <div style = {{"width" : "7.5%"}} className = "gameInfoTextBox" >
                        <h1 className = {team1Won ? "redTextLoser" : "blueTextWinner"}>{team1Won ? "Loss" : "Win"}</h1>
                      </div>

                      <div style = {{"width" : "4.5%"}} />

                      <div style = {{"width" : "25%", "justifyContent":"left"}} className = "gameInfoTextBox">
                        <h1>Red Team</h1>
                      </div>
                      

                      {topMostRow}


                    </div>

                    {team2}
                  </div>
                </div>
              ];

              let fakeMatches = this.state.matches;
              fakeMatches[i] = temp;
              this.setState({matches : fakeMatches});

              let fakeUpper = this.state.upperAccordion;
              let playerInfo = null;
              let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
              let fuckingDate = new Date(res.data.info.gameCreation)
              let month = months[fuckingDate.getMonth()];
              let day = fuckingDate.getDate()
              let year = fuckingDate.getFullYear();

              for(let j = 0; j < 10; j++){
                if(res.data.info.participants[j].summonerName.toLowerCase() == personToSearch.toLowerCase()){
                  playerInfo = res.data.info.participants[j]

                  if(playerInfo.summonerName.toLowerCase() == personToSearch.toLowerCase()){
                    let fakeWinLose = this.state.winLoseGame;
                    if(j < 5){
                      if(team1Won) fakeWinLose[i] = true;
                      else fakeWinLose[i] = false;
  
                      this.setState({winLoseGame : fakeWinLose});
                    }
                    else{
                      if(team1Won) fakeWinLose[i] = false;
                      else fakeWinLose[i] = true;
  
                      this.setState({winLoseGame : fakeWinLose});
                    }
                    if(fakeWinLose[i]) this.setState((prevState) => ({gamesWon: prevState.gamesWon + 1})); 
                  }

                  break
                }
              }

              fakeUpper[i] = (
              <div className = {this.state.winLoseGame[i] ? "gameInfoUnopened gameUnopenedWinner" : "gameInfoUnopened gameUnopenedLoser"}>
                <div className = "unOpenedLeftSide">
                  <div className = "winLoseInfo">
                    <h1>{this.state.winLoseGame[i] ? "Victory" : "Defeat"}</h1>
                  </div>

                  <div className = "gameStuffInfo">
                    <h2>{"Ranked Flex"}</h2>
                    <h2>{"Summoner's Rift"}</h2>
                  </div>

                  <div className = "gameStuffInfo">
                    <h2>{Math.floor(res.data.info.gameDuration / 1000 / 60).toString() + "m " + (Math.floor(res.data.info.gameDuration / 1000) % 60).toString() + "s"}</h2>
                    <h2>{month + " " + day + " " + year}</h2>
                  </div>
                </div>

                <div className = "unOpenedPlayerInfo">
                  <div className = "gameStuff">
                    <Image src={`../images/champion/${playerInfo.championName}.png`} alt = "champion" className = "championImage" roundedCircle/>
                    <div className = "summonerSpellContainer">
                      <Image src ={`../images/spell/${findSumm(playerInfo.summoner1Id).image.full}`} className = "summonerSpellImage" />
                      <Image src ={`../images/spell/${findSumm(playerInfo.summoner2Id).image.full}`} className = "summonerSpellImage" />
                      <div style = {{width:"1vw"}} />
                    </div>
                    
                    <div className = "unOpenedItems">
                      {[...Array(7)].map((value, index) => {
                          let currentItem = playerInfo["item" + index.toString()]

                          if(currentItem == "0") return (<img src={`../images/item/emptyItemSlot.png`} className = "normalItem"/>);
                          else return(<img src={`../images/item/${playerInfo["item" + index.toString()]}.png`} className = "normalItem"/>);
                      })}
                  </div>
                  </div>

                  <div className = "unOpenedRightSide">
                    <h2>{playerInfo.kills + "/" + playerInfo.deaths + "/" + playerInfo.assists}</h2>
                    <h2>{playerInfo.totalMinionsKilled + " CS"}</h2>
                    <h2>{playerInfo.goldEarned + " Gold"}</h2>
                  </div>
                </div>
              </div>  
              );
              
              let fakeFavRole = this.state.favRole;
              let fakeFavChamp = this.state.favChamp;
              
              let foundRole = -1
              let foundChamp = -1
              for(let i = 0; i < fakeFavChamp.length; i++){
                if(fakeFavChamp[i]["champ"] == playerInfo.championName) foundChamp = i
              }
              if(foundChamp != -1){
                fakeFavChamp[foundChamp]["count"] += 1
              }
              else{
                fakeFavChamp.push({"champ" : playerInfo.championName, "count" : 1})
              }


              if(playerInfo.individualPosition == "UTILITY") playerInfo.individualPosition = "SUPPORT"
              for(let i = 0; i < fakeFavRole.length; i++){
                if(fakeFavRole[i]["role"] == playerInfo.individualPosition) foundRole = i
              }
              if(foundRole != -1){
                fakeFavRole[foundRole]["count"] += 1
              }
              else{
                fakeFavRole.push({"role" : playerInfo.individualPosition, "count" : 1})
              }

              console.log(fakeFavChamp)
              console.log(fakeFavRole)

              this.setState((prevState) => ({
                upperAccordion : fakeUpper, 
                totalKills: prevState.totalKills + playerInfo.kills,
                totalDeaths : prevState.totalDeaths + playerInfo.deaths,
                totalAssists : prevState.totalAssists + playerInfo.assists,

                favChamp : fakeFavChamp,
                favRole : fakeFavRole
              })); 
            })
        }
      })

    await axios.post("http://localhost:3000/joker/baby", {"url": "https://na1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/" +  this.state.encryptedId})
      .then(res => {
        
        let fakeMasteryData = ["second highest", "highest", "third highest"];

        for(let i = 0; i < 3; i++){
          let champInfo = {
            champId : "asd",
            champName : "no clue",
            masteryLevel : 1,
            masterPoints : 0
          };
          
          champInfo.champId = findChamp(res.data[i].championId).id;
          champInfo.champName = findChamp(res.data[i].championId).name;
          champInfo.masteryLevel = res.data[i].championLevel
          champInfo.masteryPoints = res.data[i].championPoints
          
          let item = (
          <div className = "championMasteryInfo" >
            <Image src={`../images/champion/${champInfo.champId}.png`} alt = "champion" className = "masteryChampionImage" roundedCircle thumbnail/>
            <Image src={`../images/mastery/mastery_${champInfo.masteryLevel}.png`} alt = "champion" className = "championMasteryLevelImage" roundedCircle />
            <h1>{champInfo.champName}</h1>
            <h2>{champInfo.masteryPoints}</h2>
          </div>
          );

          if(i == 0) fakeMasteryData[0] = item
          if(i == 1) fakeMasteryData[1] = item
          if(i == 2) fakeMasteryData[2] = item

          //fakeMasteryData.push(item)
        }
        this.setState({masteryData : fakeMasteryData});
      })
  }

  

  render(){

    let gameRenders = []

    for(let i = 0; i < this.state.matchesFound; i++){

      gameRenders.push(
        <div className = "gameAccordionDiv">
          <Accordion>
            <div>
              {this.state.upperAccordion[i]}
              <CustomToggle eventKey="0" winLose = {this.state.winLoseGame[i] ? "gameOpenerWon" : "gameOpenerLost"}>
                <h2 className = "accordionOpenerText">Open</h2>
              </CustomToggle>
            </div>
            <Accordion.Collapse eventKey="0">
              <div>
                {this.state.matches[i]}
              </div>
            </Accordion.Collapse>
          </Accordion>
        </div>

      );
    }

    if(this.state.matchesFound == 0){
      gameRenders.push(
        <div>

        </div>
      )
    }

    let favouriteChampion = {"champ" : "None", "count" : 0};
    let favouriteRole = {"role": "None", "count": 0};
    for(let i = 0; i < this.state.favChamp.length; i++){
      if(favouriteChampion.count < this.state.favChamp[i].count){
        favouriteChampion = {"champ" : this.state.favChamp[i].champ, "count":this.state.favChamp[i].count}
      }
    }
    for(let i = 0; i < this.state.favRole.length; i++){
      if(favouriteRole.count < this.state.favRole[i].count){
        favouriteRole = {"role" : this.state.favRole[i].role, "count":this.state.favRole[i].count}
      }
    }


    return (
      <div className = "everythingContainer">
        

        <div className="summonerInfoContainer">

        <Container>
        <Row>

          <Col md = {6} xs = {12} sm = {12}>
            <div className = "leftSide">

              <div className = "playerInfoStuff">
                <img src={`../images/profileicon/${this.state.summonerProfile}.png`} className = "summonerInfoImage"/>
                
                <div style = {{marginLeft:"1vw", width : "max(20vw, 40vh)"}} className = "summonerInfoText">
                  <h1 className = "specialText">{this.state.summonerName}</h1>
                  <h1 className = "thinText">Level {this.state.summonerLevel}</h1>
                </div>
              </div>

              <div className = "championMastery flex">
                {this.state.masteryData}
              </div>

            </div>
            
          </Col>
          <Col md = {6} xs = {12} sm = {12}>

            <div style = {{"height":"70vh"}}>
              <div className = "rankedInfoContainer">

                <div className = "rankedInfo">
                  <h2 className = "rankedTitle">Ranked Solo</h2>
                  <h1>{this.state.rankedSoloInfo.tier[0].toUpperCase()}{this.state.rankedSoloInfo.tier.slice(1,10000000).toLowerCase()} {this.state.rankedSoloInfo.rank == "unranked" ? "" : this.state.rankedSoloInfo.rank}</h1>
                  <h1 className = "thinText">{this.state.rankedSoloInfo.lp} LP</h1>
                  <Image src={`../images/ranked-emblems/${this.state.rankedSoloInfo.tier}.png`} alt="rankedEmblem" className = "rankedEmblems" />
                </div>

                <div className = "rankedInfo">
                  <h2 className = "rankedTitle">Ranked Flex</h2>
                  <h1>{this.state.rankedFlexInfo.tier[0].toUpperCase()}{this.state.rankedFlexInfo.tier.slice(1,10000000).toLowerCase()} {this.state.rankedFlexInfo.rank == "unranked" ? "" : this.state.rankedFlexInfo.rank}</h1>
                  <h1 className = "thinText">{this.state.rankedFlexInfo.lp} LP</h1>
                  <img src={`../images/ranked-emblems/${this.state.rankedFlexInfo.tier}.png`} alt="rankedEmblem" className = "rankedEmblems" />
                </div> 

              </div>

              
              <div className = "AllGameInfo">
                <div style = {{width : "10%"}}/>
                <div style = {{width:"54%"}} className="allGameText">
                  <h2>{this.state.gamesWon.toString() + (this.state.gamesWon == 1 ? " Win" : " Wins")}</h2>
                  <h2>{(this.state.totalKills / 10).toString() + "/" + (this.state.totalDeaths / 10).toString() + "/" + (this.state.totalAssists / 10).toString() + " Average"}</h2>
                  <h2>{favouriteChampion.champ + " - " + favouriteChampion.count.toString() + " Games"}</h2>
                  <h2>{favouriteRole.role.slice(0,1) + favouriteRole.role.slice(1, favouriteRole.role.length).toLowerCase() + " - " + favouriteRole.count.toString() + " Games"}</h2>
                </div>
                <div style = {{width : "25%"}}>
                  <h1 className = "inTenGames">In {this.state.matchesFound.toString()} Games</h1>
                </div>
              </div>
            </div>

          </Col>

        </Row>
        </Container>
        </div>

        

        
        
        {gameRenders}

      </div>
    );
  }
}

