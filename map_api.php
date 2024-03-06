<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json", true);


if(empty($_REQUEST['ApiKey']) || $_REQUEST['ApiKey'] != "c383201894e58cde838c5f496bd169a2") {
	Handlers::apiError("Missing / invalid parameter: ApiKey.");
}

if(empty($_REQUEST['Language']))
	$_REQUEST['Language'] = 0;

switch ($_REQUEST['Action']) {

	case 'GetFeatureInfo':

		$ch	  = curl_init(@$_REQUEST["url"]);
		$options = array(
			CURLOPT_SSL_VERIFYPEER	=> false,
			CURLOPT_RETURNTRANSFER	=> true,
			CURLOPT_USERPWD			=> "admin:agro1G30SmartG",
			CURLOPT_HTTPHEADER		=> array( "Accept: application/json" ),
			);

		curl_setopt_array($ch, $options);

		$JsonResponse = curl_exec($ch);

		$JsonResponse = json_decode($JsonResponse, true);
		echo json_encode($JsonResponse["features"][0]["properties"]["GRAY_INDEX"]);

	break;

	case 'GetInformationsText':
		echo '{"id":"389","value":"<div align=\"center\"><div align=\"center\" style=\"width: 90%;\">A kutatást, amelyet a Széchenyi István Egyetem valósított meg, az Innovációs és Technológiai Minisztérium és a Nemzeti Kutatási, Fejlesztési és Innovációs Hivatal támogatta az Autonóm Rendszerek Nemzeti Laboratórium (ARNL) keretében.</div><div align=\"center\">&nbsp;</div><div align=\"center\"><img src=\"img/zalazone_feher.png\" height=\"60px\">&nbsp;<img src=\"img/sze_logo.png\" height=\"60px\">&nbsp;<img src=\"img/jkk_szoveggel.png\" height=\"60px\"></div><div align=\"center\">&nbsp;</div></div>"}';
		//echo json_encode('{"id":"389","value":"<p class=\"MsoNormal\" style=\"text-align:center\" align=\"center\"><font size=\"3\"><b><span style=\"line-height: 107%;\"><font size=\"3\">\u00dcdv\u00f6z\u00f6lj\u00fck a SmartGazda projekt oldal\u00e1n!<\/font><br><\/span><\/b><font size=\"2\">A Smartgazda projekt (GINOP-2.2.1-15-2017-00105)\r\nf\u0151 c\u00e9lja, hogy a gazd\u00e1lkod\u00f3knak tan\u00e1csot adjon a prec\u00edzi\u00f3s gazd\u00e1lkod\u00e1sra val\u00f3\r\n\u00e1tt\u00e9r\u00e9s, illetve a prec\u00edzi\u00f3s technol\u00f3gi\u00e1k alkalmaz\u00e1sa sor\u00e1n.<o:p><\/o:p><br>A t\u00e9rk\u00e9pes\r\nmegjelen\u00edt\u0151 fel\u00fcleten a gazd\u00e1lkod\u00f3 \u00e9rt\u00e9kes talajtani adatokat tal\u00e1lhat,\r\nlet\u00f6lthet\u0151, elemezhet\u0151 form\u00e1tumban. <o:p><\/o:p><br>A t\u00e9rk\u00e9pek el\u00e9r\u00e9s\u00e9hez\r\na regisztr\u00e1ci\u00f3 sor\u00e1n k\u00e9rj\u00fck, t\u00f6ltse ki az innov\u00e1ci\u00f3s szintfelm\u00e9r\u0151 k\u00e9rd\u0151\u00edv\u00fcnket.\r\nA kit\u00f6lt\u00e9st k\u00f6vet\u0151en a t\u00e9rk\u00e9pek szabadon hozz\u00e1f\u00e9rhet\u0151k, illetve a felhaszn\u00e1l\u00f3\r\nt\u00e1j\u00e9koz\u00f3dhat az aktu\u00e1lis innov\u00e1ci\u00f3s felk\u00e9sz\u00fclts\u00e9g\u00e9r\u0151l.<\/font><br><\/font><\/p><p class=\"MsoNormal\" style=\"text-align:center\" align=\"center\"><a href=\"http:\/\/map.smartgazda.hu\/images\/smartgazda_tamogatas.png\" title=\"\" target=\"_blank\"><font size=\"3\"><img src=\"http:\/\/map.smartgazda.hu\/images\/smartgazda_tamogatas.png\" width=\"200\"><\/font><\/a><\/p>","original_value":"Inform\u00e1ci\u00f3s sz\u00f6veg","category_id":"1","value_type":"textarea","image_width":"0","image_height":"0","key":"panel_informations","language":"0"}');

	break;

	
}

die();

?>