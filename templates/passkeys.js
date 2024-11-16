async function authn(formId) {
    const form = document.getElementById(formId);
    if (!form) {
        console.error("Form not found");
        return;
    }

    try {
        const response = await fetch(form.action, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": form.querySelector("input[name='csrfmiddlewaretoken']").value,
            },
            body: JSON.stringify({ request_type: "webauthn" })
        });

        const data = await response.json();

        if (data.challenge) {
            const assertion = await navigator.credentials.get({
                publicKey: data.challenge
            });

            form.querySelector("#passkeys").value = JSON.stringify(assertion);
            form.submit();
        }
    } catch (error) {
        console.error("Error during passkey authentication", error);
    }
}
