// Script to unregister all service workers
// Add this to your app temporarily to clean up existing registrations

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('✅ Service Worker unregistered');
    }
  });
}
