<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
   integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
   crossorigin=""/>
<link rel="stylesheet" href="https://use.fontawesome.com/b0fbc1cb2d.css">
<!-- Latest compiled and minified CSS -->
<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
  <style>
  #map { 
    width: 100%;
    height: 700px; 
  }
  </style>
</head>
<body>
  <div class="container">
    <div class="row">
      <div class="col-12">
        <h1>Women's Rights Properties</h1>
      </div>
    </div>
    <div class="row">
      <div class="col-8">
        <div id="map"></div>
      </div>
      <div class="col-4">
        <ul id="properties" class="list-unstyled">
        </ul>
      </div>
    </div>
  </div>
  <script src="/dist/womens-rights-properties.js"></script>
</body>
</html>