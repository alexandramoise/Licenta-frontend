const API_URL = "http://localhost:8080/recommandations";

async function addRecommandation(recommandationDto, doctorEmail) {
    const response = await fetch(API_URL + "?email=" + doctorEmail, {
        method: "POST", 
        body: JSON.stringify({
            text: recommandationDto.text,
            recommandationType: recommandationDto.recommandationType,
            hashtag: recommandationDto.hashtag,
        }),
        headers: {
            "Content-type": "application/json; charset=UTF-8",
        },
    });

    const data = await response.json();
   
    if (!response.ok) {
        throw new Error(data.message || 'Eroare la adaugarea recomandarii');
    }
    
    return data;
}

async function getAllRecommandations(doctorEmail, pageSize, pageNumber) {
    try {
        const response = await fetch(API_URL + "/all?email=" + doctorEmail + "&pageSize=" + pageSize + "&pageNumber=" + pageNumber);

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

async function getRecommandationsByType(doctorEmail, type, pageSize, pageNumber) {
    try {
        const response = await fetch(API_URL + "/byType?email=" + doctorEmail +  "&pageSize=" + pageSize + "&pageNumber=" + pageNumber 
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

async function getRecommandationsByHashtag(doctorEmail, hashtag, pageSize, pageNumber) {
    try {
        const response = await fetch(API_URL + "/byHashtag?email=" + doctorEmail + "&pageSize=" + pageSize + "&pageNumber=" + pageNumber 
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

async function getRecommandationsByHashtagAndType(doctorEmail, type, hashtag, pageSize, pageNumber) {
    try {
        const response = await fetch(API_URL + "/byHashtagAndType?email=" + doctorEmail +  "&pageSize=" + pageSize + "&pageNumber=" + pageNumber + 
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

async function getAllRecommandationsForPatient(doctorEmail, type, pageSize, pageNumber) {
    try {
        const response = await fetch(API_URL + "/forPatient/all?email=" + doctorEmail +  "&pageSize=" + pageSize + "&pageNumber=" + pageNumber 
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

async function getRecommandationsForPatientByHashtag(doctorEmail, type, hashtag, pageSize, pageNumber) {
    try {
        const response = await fetch(API_URL + "/forPatient/byTag?email=" + doctorEmail +  "&pageSize=" + pageSize + "&pageNumber=" + pageNumber + 
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
    addRecommandation,
    getAllRecommandations,
    getRecommandationsByType,
    getRecommandationsByHashtag,
    getRecommandationsByHashtagAndType,
    getAllRecommandationsForPatient,
    getRecommandationsForPatientByHashtag
}