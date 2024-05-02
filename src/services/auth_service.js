const API_URL = "http://localhost:8080/api/auth";

async function login(loginRequestDto) {
    try {
        const response = await fetch(API_URL + "/login", {
            method: "POST", 
            body: JSON.stringify({
                email: loginRequestDto.email,
                password: loginRequestDto.password,
            }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        });

        if (!response.ok) {
            let message = "Eroare necunoscută";
            
            switch(response.status) {
                case 404:
                    message = "Nu exista un cont pentru aceasta adresa de mail";
                    break;
                case 401:
                    message = "Credentiale incorecte";
                    break;
            }
            return { error: true, message: message };
        }

        let data = await response.json();
        console.log(data);
        localStorage.setItem('token', data.jwtToken);
        localStorage.setItem('role', data.role);
        return { error: false, token: data.jwtToken };

    } catch (error) {
        console.error("Could not log in:", error);
        return { error: true, message: "Eroare server" };
    }
}



export { login }