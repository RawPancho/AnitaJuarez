      const CLIENT_ID = '975138822531-kc3rvpocfo6m56qh0mv50itfeko0udb8.apps.googleusercontent.com';
      const API_KEY = 'AIzaSyBoAXvSua9gw0njTpFMuXmq13iJgruRrEE';
      const SHEETSID = '1JG6vntHGDJo5K5MkAahw1CDoXs656Sal_AyTWd1XyNM';
      const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
      const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

      let tokenClient;
      let gapiInited = false;
      let gisInited = false;

      document.getElementById('gapi').addEventListener('load',gapiLoaded);
      document.getElementById('gis').addEventListener('load',gisLoaded);

      document.getElementById('authorize_button').style.visibility = 'hidden';
      document.getElementById('signout_button').style.visibility = 'hidden';

      window.onload = function() {
        document.getElementById('authorize_button').innerText = 'Autorizar';
        document.getElementById('signout_button').style.visibility = 'hidden';
      };
   
      function gapiLoaded() {
        gapi.load('client', initializeGapiClient);
      }

      async function initializeGapiClient() {
        await gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: [DISCOVERY_DOC],
        });
        gapiInited = true;
        maybeEnableButtons();
        checkStoredToken();
      }

      /**
       * Callback after Google Identity Services are loaded.
       */
      function gisLoaded() {
        tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: '', // defined later
        });
        gisInited = true;
        maybeEnableButtons();
        
      }

      /**
       * Enables user interaction after all libraries are loaded.
       */
      function maybeEnableButtons() {
        if (gapiInited && gisInited) {
          document.getElementById('authorize_button').style.visibility = 'visible';
        }
      }
      /**
       *  Sign in the user upon button click.
       */
      function handleAuthClick() {
        tokenClient.callback = async (resp) => {
          if (resp.error !== undefined) {
            throw (resp);
          }
          saveToken();
          onAuthSuccess();
        };

        if (gapi.client.getToken() === null) {
          // Prompt the user to select a Google Account and ask for consent to share their data
          // when establishing a new session.
          tokenClient.requestAccessToken({prompt: 'consent'});
        } else {
          // Skip display of account chooser and consent dialog for an existing session.
          tokenClient.requestAccessToken({prompt: ''});
        }
      }

      /**
       *  Sign out the user upon button click.
       */
      function handleSignoutClick() {
        const token = gapi.client.getToken();
        if (token !== null) {
          google.accounts.oauth2.revoke(token.access_token);
          gapi.client.setToken('');
          localStorage.removeItem('gapiToken'); // Elimina el token guardado
          onSignout();
        }
      }

      function saveToken() {
        const token = gapi.client.getToken();
        if (token) {
          localStorage.setItem('gapiToken', JSON.stringify(token));
        }
      }
      
      // Función para verificar y cargar el token guardado
      function checkStoredToken() {
        const savedToken = JSON.parse(localStorage.getItem('gapiToken'));
        if (savedToken) {
          gapi.client.setToken(savedToken);
          onAuthSuccess();
        }
      }

      async function onAuthSuccess() {
        await muestraDeActa();
        document.getElementById('btn_reportar').disabled = false;
        document.getElementById('btn_sc').disabled = false;
        document.getElementById('signout_button').style.visibility = 'visible';
        document.getElementById('authorize_button').innerText = 'Refresh';
      }
      
      function onSignout() {
        document.getElementById('authorize_button').innerText = 'Autorizar';
        document.getElementById('signout_button').style.visibility = 'hidden';
        document.getElementById('btn_reportar').disabled = true;
        document.getElementById('btn_sc').disabled = true;
      }
