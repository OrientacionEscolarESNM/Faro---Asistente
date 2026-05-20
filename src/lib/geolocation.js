export const getUserLocation = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ status: "No soportado por el navegador", coords: null });
      return;
    }

    // Intentar primero con alta precisión
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
        // Si el usuario denegó el permiso, no reintentamos
        if (error.code === error.PERMISSION_DENIED) {
          resolve({ status: "denied", coords: null });
          return;
        }

        // Si falló por timeout o no disponible, reintentamos con baja precisión (red/IP)
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              status: "granted",
              coords: {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
              }
            });
          },
          (err) => {
            let status = "Desconocido";
            if (err.code === err.PERMISSION_DENIED) {
              status = "denied";
            } else if (err.code === err.POSITION_UNAVAILABLE) {
              status = "unavailable";
            } else if (err.code === err.TIMEOUT) {
              status = "timeout";
            }
            resolve({ status, coords: null });
          },
          {
            enableHighAccuracy: false,
            timeout: 5000,
            maximumAge: Infinity // Permitir usar ubicación de caché
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 5000, // 5 segundos para alta precisión
        maximumAge: 0
      }
    );
  });
};
