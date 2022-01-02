import react , {useState , useEffect} from "react";
import {Footer,Toppopular,Upcoming,Currentlyairing,Header} from "./topanime";
import "./animestyle.css";
import "./topanimestyle.css";
import {TopofyourList} from "./topanime";
import { Link } from "react-router-dom";
import { useQuery,useQueries } from "react-query";
import axios from "axios";
import reduce from "awaity/reduce";
import each from "awaity/each";
import { Spinner } from "./loading-spinner";



function TopacharMain()
{
    const year = new Date().getFullYear();
    const month = new Date().getMonth();    
    let tempyear = year;
    if(month <6)
    {
        tempyear = year-1;
    }
    if(month <9 )
    {
        tempyear = year-1;
    }


    const fetchQuery = (url)=>
    {
        return axios.get(url).then(res=>[...res.data.top].slice(0,16));
    }
    const fetch_broad_request =async (url_init)=>
    {
        const delay = (ms = 4000) => new Promise(r => setTimeout(r, ms));
        
      return await axios.get(url_init).then( response => response.data.anime).
        then(result_summer =>[...result_summer].slice(0, 4))
        .then(async summer_anime =>{
             return await reduce(summer_anime,async(acc,anime)=>
             {
                

                const { mal_id } = anime;
                await delay();
                const value_charater_stuff = await fetch(`https://api.jikan.moe/v3/anime/${mal_id}/characters_staff`).
                    then(async res => {
                        const result = await res.json();
                        const anime_char_sum = [...result.characters];
                        return anime_char_sum;
                    }).
                    then(res_char_summer => {

                        return res_char_summer.reduce((acc, char) => {

                            const { mal_id, name, role, image_url } = char;
                            return (role === "Main") ?
                                [...acc, { mal_id, title: name, image_url }] : acc
                        }, [])
                    }).catch(err => console.log(err));

                if (value_charater_stuff) {
                   acc.push(value_charater_stuff);
                }
                
                return acc;
             },[])

        }).then(result => result);
      
    }
 
    const results = useQueries([
        {queryKey:"top_char",
        queryFn:()=>fetchQuery("https://api.jikan.moe/v3/top/characters/1"),
        refetchOnWindowFocus:false,
        staleTime: 4000, 
        cacheTime: Infinity,
        retry:false}
        ,
        {
            queryKey: "summer_top_char", 
            queryFn: () => fetch_broad_request(`https://api.jikan.moe/v3/season/${tempyear}/summer`), 
            refetchOnWindowFocus: false, 
            retryDelay: 2000, 
            staleTime: 4000, 
            cacheTime: Infinity, 
            select: prevValue => Array.prototype.concat.apply([], prevValue)
        }, 
        {
            queryKey: "fall_top_char", 
            queryFn: () => fetch_broad_request(`https://api.jikan.moe/v3/season/${tempyear}/fall`), 
            refetchOnWindowFocus: false, 
            retry:12,
            retryDelay: 2000, 
            staleTime: 4000, 
            cacheTime: Infinity, 
            select: prevValue =>Array.prototype.concat.apply([], prevValue)
        }])
    console.log(results);
    

    const [listitem,setListitem] = useState([]);
    const [listcount,setListcount] = useState(0);
    let temparray = null;
    temparray = JSON.parse(localStorage.getItem("item_char"));

    if(temparray)
    {
        temparray = [...temparray].sort((a,b)=>b.fav - a.fav).slice(0,3);
       
    }

    const delay = (ms = 3000) => new Promise(r => setTimeout(r, ms));
    const fetch_top_char = async() =>
    {
       if(temparray)
       {
           setListcount(temparray.length);
           await each(temparray, async (item) => {

               const { malid, img_url, title } = item;
               const response = await fetch(`https://api.jikan.moe/v3/character/${malid}`);
               const result = await response.json();

               setListitem((item) => [...item, { malid, img_url, title, about: result.about }]);
               await delay();
           })
       }
       
          
    }
   
    useEffect(()=> fetch_top_char(),[]);
  
    return <>
        
        {(results.some(item => item.isLoading) || listitem.length < listcount) ? <Spinner />
            : results.some(item => item.isError) ? <h2 style={{ color: "red", position: "relative", zIndex: "22" }}>Error</h2>
                :
                <div className="container1" style={{ height: "1300px" }}>
                    <div className="section-1">
                        <Header content={{ text: ["Character", "", "", "VERSE"], isanimateable: false, subtext: "Just LOOK at Them..." }} />
                        {(!results[0].isLoading) ? <Currentlyairing airing={results[0].data} count={16} text_={["Most", "popular"]} /> : ""}
                        <div className="cotntext-1">
                            <span><h2>Stars of the</h2></span>
                            <span><h2>Summer</h2></span>
                        </div>
                    </div>
                    <div className="section-2">
                        {(!results[1].isLoading) ? <Upcoming upcoming={results[1].data} count={7} text_={["Popular in ", "Summer"]} /> : ""}

                        <div className="cotntext-2">
                            <span><h2>Meet the</h2></span>
                            <span><h2>popular</h2></span>
                            <span><h2>Kids</h2></span>
                        </div>
                    </div>
                    <div className="section-3">
                        {(results[2].data) ? <Toppopular popular={results[2].data} count={7} text_={["Popular", " in", "Fall"]} /> : ""}
                        <div className="cotntext-3">
                            <span><h2>What's On Your</h2></span>
                            <span><h2>Inventory?</h2></span>
                        </div>
                    </div>
                    <div className="section-4">
                        {listitem && results.every(item => !item.isLoading) ? <TopofyourList listitem={listitem} text_={"Top Characters from your list"} /> : ""}
                    </div>
                  
                </div>
        }
       {  (results.some(item => item.isLoading) || listitem.length < listcount)?"":<Footer/>}
          
        </>
}




export default TopacharMain;