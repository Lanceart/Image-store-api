document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData();
    const imageField = document.querySelector('input[type="file"]');

    formData.append('image', imageField.files[0]);

    fetch('/upload', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(result => {
        console.log('Success:', result);
        alert('Image uploaded successfully!');
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error uploading image');
    });
});
