<?php  
require __DIR__ . '/vendor/autoload.php';
//https://github.com/reactphp/promise#done-vs-then
//https://github.com/guzzle/promises#promise
use maxh\Nominatim\Nominatim;
use eaglewu\Classes\PHPExcel;
use GuzzleHttp\Promise\Promise;
use function GuzzleHttp\Promise\all;

// print_r($nominatim->find($search));
$url = "http://nominatim.openstreetmap.org/";
$nominatim = new Nominatim($url);

$file = realpath('./WomensRightsProperties.xlsx');
$excelReader = PHPExcel_IOFactory::createReaderForFile($file);
$excelObj = $excelReader->load($file);
$worksheet = $excelObj->getSheet();
$rows = $worksheet->getRowIterator();

/**
 * Take an PHPExcel_Worksheet_RowIterator
 * and return back an array with all of the 
 * row data 
 * @return Array
 */
function getDataFromRows(PHPExcel_Worksheet_RowIterator $rows) {
  $data = array();
  $header = array();
  while($rows->valid()) {
    $current_row = $rows->current();
    $cells = $current_row->getCellIterator();
    $cell_data = array();
    while($cells->valid()) {
      $current_cell = $cells->current();
      $column_value = $current_cell->getColumn();

      if($current_cell->getRow() > 1) {
        if($header[$column_value]['value']) {
          $cell_data[$header[$column_value]['value']] = array(
            'value' => $current_cell->getValue(),
          );
        }
      } else {
        // setup headers
        $header[$column_value] = array(
          'value' => $current_cell->getValue()
        );
      }

      $cells->next();
    }

    if(sizeof($cell_data)) {
      $data[] = $cell_data;
    }

    $rows->next();
  }
  return $data;
}

$excel_data = getDataFromRows($rows);

/**
 * Get some data look for the address value and
 * create a new nominatim api search to setup a 
 * request to get all of the needed address data
 * @param Array $address_array an array with address data
 * @param Nominatim $nominatim a request object
 * @param String $city the default city
 * @param String $state the default state
 * @param String $country the default country
 * @return Array an array of GuzzleHttp\Promise\Promise
 */
function getGeoData($address_array, Nominatim $nominatim, $city = 'San Francisco', $state = 'California', $country = 'USA') {
  $promises = [];
  foreach($address_array as $key => $value) {
    $promise = new Promise();
    $street_address = $value['Address']['value'] ? $value['Address']['value'] : '';
    $search = $nominatim->newSearch()
      ->country($country)
      ->city($city)
      ->state($state)
      ->street($street_address)
      ->addressDetails('1');
    $promise->resolve($nominatim->find($search));
    $promises[] = $promise;
  }
  return $promises;
}

// get all of request data
$all_request_promises = getGeoData($excel_data, $nominatim);
$all = all($all_request_promises);
// make a synchronious call
$street_data = $all->wait();

// append to the data we want in a json file
foreach($excel_data as $key => $value) {
  $excel_data[$key]['geodata'] = $street_data[$key];
}

// output the json file
$fp = fopen('results.json', 'w');
fwrite($fp, json_encode($excel_data));
fclose($fp);

?>
