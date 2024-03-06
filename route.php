<?php
$rowid = $_GET["id"];

function csvtojson($file,$delimiter,$rowid)
{
    if (($handle = fopen($file, "r")) === false)
    {
            die("can't open the file.");
    }

    $csv_headers = fgetcsv($handle, 4000, $delimiter);
    $csv_json = array();

    while ($row = fgetcsv($handle, 4000, $delimiter))
    {
            $csv_json[] = array_combine($csv_headers, $row);
    }

    //$csv_json2[0] = $csv_json[0];
    //$csv_json2[1] = $csv_json[$rowid];
    
    if($rowid > count($csv_json)) {
        $rowid = $rowid % count($csv_json);
    }


    fclose($handle);
    //return json_encode($csv_json);
    return json_encode($csv_json[$rowid]);
}


//$jsonresult = csvtojson("data/inner_map_zala_0_utm.csv", ";", $rowid);
$jsonresult = csvtojson("data/zala_sav_kozep_uj1.csv", ";", $rowid);

echo $jsonresult;
//echo $rowid;
/*
$file="data/inner_map_zala_0_utm.csv";
$csv= file_get_contents($file);
$array = array_map("str_getcsv", explode("\n", $csv));
$json = json_encode($array);
print_r($json);
  */
?>