async function registerPasskey() {
    try {
        const response = await fetch('/register-passkey/', {
            method: "POST",
            headers: {
                "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value
            }
        });

        const data = await response.json();

        if (data.challenge) {
            const publicKey = {
                challenge: Uint8Array.from(atob(data.challenge), c => c.charCodeAt(0)),
                rp: data.rp,
                user: {
                    id: Uint8Array.from(atob(data.user.id), c => c.charCodeAt(0)),
                    name: data.user.name,
                    displayName: data.user.displayName
                },
                pubKeyCredParams: data.pubKeyCredParams,
                authenticatorSelection: {
                    userVerification: "preferred"
                },
                timeout: 60000,
            };

            const credential = await navigator.credentials.create({ publicKey });

            const completeResponse = await fetch('/register-passkey/', {
                method: "PUT",
                headers: {
                    "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: credential.id,
                    rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
                    response: {
                        clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(credential.response.clientDataJSON))),
                        attestationObject: btoa(String.fromCharCode(...new Uint8Array(credential.response.attestationObject))),
                    }
                })
            });

            if (completeResponse.ok) {
                alert("Passkey registered successfully!");
                window.location.href = "/";
            } else {
                alert("Failed to register passkey. Ensure only one passkey per device.");
            }
        }
    } catch (error) {
        console.error("Error during passkey registration:", error);
    }
}


async function loginWithPasskey() {
    try {
        const response = await fetch('/login/', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value
            },
            body: JSON.stringify({ request_type: "webauthn" })
        });

        const data = await response.json();

        if (data.challenge) {
            const options = {
                publicKey: {
                    challenge: Uint8Array.from(atob(data.challenge.challenge), c => c.charCodeAt(0)),
                    allowCredentials: data.challenge.allowCredentials.map(cred => ({
                        id: Uint8Array.from(atob(cred.id), c => c.charCodeAt(0)),
                        type: cred.type
                    }))
                }
            };

            try {
                const assertion = await navigator.credentials.get(options);

                const authResponse = await fetch('/login/', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value
                    },
                    body: JSON.stringify({
                        response: {
                            id: assertion.id,
                            clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(assertion.response.clientDataJSON))),
                            authenticatorData: btoa(String.fromCharCode(...new Uint8Array(assertion.response.authenticatorData))),
                            signature: btoa(String.fromCharCode(...new Uint8Array(assertion.response.signature)))
                        }
                    })
                });

                if (authResponse.ok) {
                    alert("Successfully logged in with passkey! Redirecting...");
                    window.location.href = "/";
                } else {
                    alert("Login failed. The server could not validate the credentials. Please try again.");
                }
            } catch (error) {
                console.error("User cancelled or device issue:", error);
                alert("Passkey login was cancelled or could not be completed. Ensure your device supports WebAuthn and try again.");
            }
        } else {
            alert("Server did not provide a valid challenge for login. Please try again.");
        }
    } catch (error) {
        console.error("Error during passkey authentication:", error);
        alert("An unexpected error occurred during passkey authentication. Please check your connection and try again.");
    }
}
