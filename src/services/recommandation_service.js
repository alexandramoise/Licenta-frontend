const API_URL = "http://localhost:8080/recommandations";

async function getAllRecommandations(pageSize, pageNumber) {
    try {
        const response = await fetch(API_URL + "/all" +  "?pageSize=" + pageSize + "&pageNumber=" + pageNumber);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); 
        console.log("RECOMMANDATIONS PAGINATED: ", data); 
        return data; 
    } catch(error) {
        console.error("Could not fetch the patients", error);
    }
}

async function getRecommandationsByType(type, pageSize, pageNumber) {
    try {
        const response = await fetch(API_URL + "/byType" +  "?pageSize=" + pageSize + "&pageNumber=" + pageNumber 
                                            + "&type=" + type);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); 
        console.log("RECOMMANDATIONS FOR TYPE PAGINATED: ", data); 
        return data; 
    } catch(error) {
        console.error("Could not fetch the patients", error);
    }
}

async function getRecommandationsByHashtag(hashtag, pageSize, pageNumber) {
    try {
        const response = await fetch(API_URL + "/byHashtag" +  "?pageSize=" + pageSize + "&pageNumber=" + pageNumber 
                                            + "&hashtag=" + hashtag);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); 
        console.log("RECOMMANDATIONS BY HASHTAG PAGINATED: ", data); 
        return data; 
    } catch(error) {
        console.error("Could not fetch the patients", error);
    }
}

async function getRecommandationsByHashtagAndType(type, hashtag, pageSize, pageNumber) {
    try {
        const response = await fetch(API_URL + "/byHashtagAndType" +  "?pageSize=" + pageSize + "&pageNumber=" + pageNumber + 
                                                "&hashtag=" + hashtag + "&type=" + type);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json(); 
        console.log("RECOMMANDATIONS BY HASHTAG PAGINATED: ", data); 
        return data; 
    } catch(error) {
        console.error("Could not fetch the patients", error);
    }
}

export {
    getAllRecommandations,
    getRecommandationsByType,
    getRecommandationsByHashtag,
    getRecommandationsByHashtagAndType
}