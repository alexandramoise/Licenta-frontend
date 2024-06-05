<script setup>
import router from "@/router";

function goToLogin() {
    router.push("login");
}
</script>

<template>
    <div class="page-not">
        <div class="text-container">
            <p> Pentru a te bucura de facilitatile aplicatiei noastre, <span style="color: darkred;"> trebuie sa fii autentificat. </span> </p>
            <p> Apasa acest buton pentru a naviga la <button class="button" @click="goToLogin">PAGINA DE LOGIN</button></p>
        </div>
    </div>
</template>

<style scoped>
.page-not {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh; 
    width: 100vw;
    overflow: hidden;
    font-size: 20px; 
    text-align: center;
    padding: 20px;
    box-sizing: border-box;
    background-image: url('D:\FACULTATE\AN 3\Licenta\frontend\frontend_licenta\src\assets\images\not_auth.png'); 
    background-size: cover;
}

.text-container {
    max-width: 80%; /* Adjust width for better spacing */
    background-color: #ffdddd;
    border: 3px solid darkred;
    padding: 20px; /* Ensure padding does not cause overflow */
    box-sizing: border-box; /* Include padding in width and height calculation */
}

.button {
    padding: 10px 20px;
    background-color: #b80f20;
    border: none;
    border-radius: 5px;
    color: white;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin-top: 20px; /* Increase margin-top to separate from text */
}

.button:hover {
    background-color: #ff5c5c;
}

@media (max-width: 768px) {
    .page {
        padding: 10px; /* Reduce padding on smaller screens */
        font-size: 16px; /* Reduce font size to prevent overflow */
    }

    .button {
        font-size: 12px;
    }
}


</style>
