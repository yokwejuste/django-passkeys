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
            const challengeBuffer = Uint8Array.from(atob(data.challenge), c => c.charCodeAt(0)).buffer;
            const userIdBuffer = Uint8Array.from(atob(data.user.id), c => c.charCodeAt(0)).buffer;

            const publicKey = {
                challenge: challengeBuffer,
                rp: {
                    name: data.rp.name,
                    id: data.rp.id
                },
                user: {
                    id: userIdBuffer,
                    name: data.user.name,
                    displayName: data.user.displayName
                },
                pubKeyCredParams: data.pubKeyCredParams.map(param => ({
                    type: param.type,
                    alg: param.alg
                })),
                authenticatorSelection: {
                    userVerification: "preferred"
                },
                timeout: 60000,
            };

            console.log("PublicKeyCredentialCreationOptions:", publicKey);

            const credential = await navigator.credentials.create({publicKey});

            const completeResponse = await fetch('/register-passkey/', {
                method: "PUT",
                headers: {
                    "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: credential.id,
                    rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
                    type: credential.type,
                    response: {
                        clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(credential.response.clientDataJSON))),
                        attestationObject: btoa(String.fromCharCode(...new Uint8Array(credential.response.attestationObject)))
                    }
                })
            });

            if (completeResponse.ok) {
                alert("Passkey registered successfully!");
                window.location.href = "/";
            } else {
                alert("Failed to complete passkey registration.");
            }
        } else {
            alert("Failed to initiate passkey registration.");
        }
    } catch (error) {
        console.error("Error during passkey registration:", error);
        alert("An error occurred during passkey registration.");
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
            body: JSON.stringify({request_type: "webauthn"})
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
                alert("Logged in with passkey!");
                window.location.href = "/";
            } else {
                alert("Passkey login failed.");
            }
        }
    } catch (error) {
        console.error("Error during passkey authentication", error);
    }
}
