import { contract } from "contract";
import { initClient } from "@ts-rest/core";

const client = initClient(contract, {
    baseUrl: "http://localhost:8000",
    baseHeaders: {},
});

function App() {
    let result = client.Authentication.login({
        body: { email: "felie", password: "fajdlks;" },
    });
    console.log(result);
    return (
        <>
            <h1>Client side</h1>
        </>
    );
}

export default App;
