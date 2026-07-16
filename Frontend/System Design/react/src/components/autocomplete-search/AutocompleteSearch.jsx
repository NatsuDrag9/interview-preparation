import {useState, useEffect} from "react";
import "./AutocompleteSearch.css"

// Task - Create an autocomplete search bar 

// function AutocompleteSearch() {
//     const [searchValue, setSearchValue] = useState("");
//     const [results, setResults] = useState([]);
//     const [showResults, setShowResults] = useState(false);
//     const [activeIndex, setActiveIndex] = useState(-1);
//     const [cache, setCache] = useState({});

//     async function fetchData(isActive) {

//         // Caching
//         if(cache[searchValue]) {
//             setResults(cache[searchValue]);
//             console.log("Returned from cached results");
//             return;   
//         }
        
//         // Make the api call
//         try {
//             const response = await fetch(`https://dummyjson.com/recipes/search?q=${searchValue}`);
//             const data = await response.json();
//             console.log("Fetched data: ", data);
//             if(isActive) {
//                 setResults(data.recipes);
//                 setCache((prev) => ({...prev, [searchValue]: data?.recipes}));
//             }
//         } catch(error) {
//             // Check if it's instance of Error object
//             if(error instanceof Error) {
//                 console.error("Error occurred: ", error.message);
//             }
//             else {
//                 console.error("Unknown error occurred.");
//             }
//         }
//     }

//     useEffect(() => {
//         let active = true;
//         if(searchValue.trim() === "") {
//             // Guard empty search value 
//             setResults([])
//             return;
//         }

//         const timer = setTimeout(() => fetchData(active), 300);

//         // Cleanup function (debouncing)
//         return () => {
//             active = false;
//             clearTimeout(timer);
//         };
        
//     }, [searchValue]);

//     useEffect(() => {
//         setActiveIndex(-1);
//     }, [results]);

//     const handleKeyDown = (e) => {
//         if(results.length === 0) return;

//         if(e.key === "ArrowDown") {
//             e.preventDefault();
//             setActiveIndex((prev) => (prev === results.length - 1 ? 0 : prev+1));
//         }
//         else if (e.key === "ArrowUp") {
//             e.preventDefault();
//             setActiveIndex((prev) => (prev === 0 ? results.length - 1: prev-1));
//         }
//         else if (e.key === "Escape") {
//             setShowResults(false);
//         }
//         else if(e.key === "Enter" || e.key === "Sapce") {
//             e.preventDefault(); {
//                 if(activeIndex >= 0 && activeIndex <= results.length) {
//                     setSearchValue(e.target.value);
//                     setShowResults(false);
//                     setResults([]); // Clear the search results for a fresh search
//                 }
//             }
//         }
//      }

//      const highlightMatch = (text, query) => {
//         if(!query) return text;

//         // Split text by the query and keep case insensitivity
//         const parts = text.split(new RegExp(`(${query})`, "gi"));

//         return (
//             <span>
//                 {parts.map((part, index) => {
//                     return (
//                         part.toLowerCase() === query.toLowerCase() ? (<strong key={index} className="acs__higlight-match">{part}</strong>) : (part)
//                     )
//                 })}
//             </span>
//         )
        
//      }

//     return (
//         <div className="acs__container">
//             <h3 className="acs__title">Autocomplete Search Bar</h3>

//             <div className="acs__input-wrapper">
//                 <input type="text" onChange={(e) =>{setSearchValue(e.target.value); 
//                  }} value={searchValue} placeholder="Search recipes..." 
//                 className="acs__input" onBlur={() => {setShowResults(false)}} onFocus={() => {setShowResults(true)}} 
//                 onKeyDown={handleKeyDown}
//                  />
//                 {showResults && (
//                     <div className="acs__dropdown-container" >
//                     {results.map((item, index) => (
//                         <span
//                         key={item.id} className={`acs__option ${index === activeIndex ? "active" : ""}`} onMouseDown={() => {setSearchValue(item.name); setResults([])}}>{highlightMatch(item.name, searchValue)}</span>
//                     ))}
//                 </div>
//                 )}
//             </div>
//         </div>
//     )
// }

function AutocompleteSearch() {
    const [searchValue, setSearchValue] = useState("");
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [cache, setCache] = useState({});

  

    useEffect(() => {
        const controller = new AbortController();
          const fetchData = async() => {
        // Retrieve data from cache
        if(cache[searchValue]) {
            console.log("Return cached value for: ", searchValue);
            setResults(cache[searchValue]);
            setShowResults(false);
            return;
        }
        try {
            const response = await fetch(`https://dummyjson.com/recipes/search?q=${searchValue}`, {signal: controller.signal});
            const data = await response.json();
            console.log("Fetched data: ", data);
            setResults(data.recipes);
            // Cache the results in a key-value pair of the form: [searchValue]:[api response]
            setCache((prev) => ({...prev, [searchValue]: data?.recipes}));
        }
        catch(error) {
            if(error instanceof Error) {
                console.log("Error message: ", error.message);
            }
            else {
                console.log("An unknown errror occurred");
            }
        }
    }

        // Debounced api call
        const debounceTimerId = setTimeout(fetchData, 300);
        
        return () => {
            clearTimeout(debounceTimerId);
            controller.abort();
        }
    }, [searchValue]);

    useEffect(() => {
        setActiveIndex(-1);
    }, [results]);

    const handleKeyDown = (e) => {
        // Events - Escape, Enter  || Space, ArrowUp, ArrowDown

        if(e.key === "Escape") {
            // Close the dropdown
            setShowResults(false);
        }
        else if(e.key === "Enter" || e.key === "Space")  {
            // Set the search value
            if(activeIndex >= 0 && activeIndex <= results.length - 1){
                setSearchValue(e.target.value);
                setResults([]); // Clear the existing results for a new search
            }
        }
        else if(e.key === "ArrowUp") {
            // Navigate up
            e.preventDefault();
            setActiveIndex((prev) => prev === 0 ? results.length - 1 : prev - 1);
            // setActiveIndex((prev) => (prev-1)%results.length);

        }
        else if(e.key === "ArrowDown") {
            // Navigate down
            e.preventDefault();
            setActiveIndex((prev) => prev === results.length - 1 ? 0: prev + 1);
            // setActiveIndex((prev) => (prev + 1) % results.length);
        }
    }

    const handleMouseDown = (name) => {
        setSearchValue(name); 
        setResults([]); // Clear the results for fresh search
        // setShowResults(false);
    }

    const highlightMatch = (text, query) => {
        if(!query) return text;

        // Create a case-insensitive regex match
        const escapedQuery = query.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
        const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));

        return (
            <span>
                {parts.map((part, index) => {
                    return (
                        part.toLowerCase() === query.toLowerCase() ? <strong key={index} className="acs__highlight-match">{part}</strong> : (part)
                    )
                })}
            </span>
        )
    }

    return (
        <div className="acs__container">
            <h3 className="acs__title">Autocomplete Search Bar
            </h3>

            <div className="acs__input-wrapper">
                <input type="text" placeholder="Search recipes..." value={searchValue} onChange={(e) => {setSearchValue(e.target.value); setShowResults(true)}} onFocus={() => setShowResults(true)} onBlur={() => setShowResults(false)} className="acs__input" onKeyDown={handleKeyDown}/>

                {showResults && (
                    <div className="acs__dropdown-container">
                    {results.map((item, index) => {
                        return (
                            <span key={item.id} className={`acs__option ${index === activeIndex ? "active" : ""}`} onMouseDown={() => handleMouseDown(item.name)}>{highlightMatch(item.name, searchValue)}</span>
                        )
                    })}
                </div>
                )}
            </div>
        </div>
    )
}

export default AutocompleteSearch;