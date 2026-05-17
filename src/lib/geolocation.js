export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      resolve({ status: "No soportado por el navegador", coords: null });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          status: "granted",
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        });
      },
      (error) => {
        let status = "Desconocido";
        if (error.code === error.PERMISSION_DENIED) {
          status = "denied";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          status = "unavailable";
        } else if (error.code === error.TIMEOUT) {
          status = "timeout";
        }
        resolve({ status, coords: null });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};
