<?php
	ini_set('memory_limit', '-1');
	ini_set('max_execution_time', 1000);
	require('fpdf.php');
	
	class PDF extends FPDF
	{
		public $padding = 7;
		
		// Load data
		function LoadData($lines)
		{
			$data = array();
			foreach(preg_split("/((\r?\n)|(\r\n?))/", $lines) as $line){
				$data[] = explode('^',trim($line));
			}
			return $data;
		}
		
		// Simple table
		function BasicTable($header, $data)
		{
			$totalCols = count($header);
			if($totalCols > 9)
				$this->padding = 15;
			$widthRow = 400/$totalCols;
			$this->SetFillColor(0);
			$this->SetTextColor(255);
			$this->SetDrawColor(128,0,0);
			$this->SetLineWidth(.3);
			
			// Width
			for($i=0;$i<count($header);$i++)
				$w[$i] = $widthRow;
			// Header
			foreach($header as $col)
				$this->Cell($widthRow,10,$col,'L',0,'',true);
			$this->ln();
			
			// Color and font restoration
			$this->SetFillColor(224,235,255);
			$this->SetTextColor(0);
			$this->SetFont('');

			// Data
			$i = 0;
	        $this->SetTextColor(0,0,0);
	        $x0=$x = $this->GetX();
	        $y = $this->GetY();
	        $totalRows = count($data);
	        foreach($data as $row)
	        {
        		$totalRows--;
                $yH = $this->getTableRowHeight($row, $w);
                for($j = 0; $j < count($w) && isset($row[$j]); $j++)
                {
                	if($j==0 && $row[$j] == ''){
                		break;
                	}else{
						$this->SetXY($x, $y);
						$this->Cell($w[$j], $yH, "", 'LRB',0,'');
						$this->SetXY($x, $y);
						$this->MultiCell($w[$j],6,$row[$j],0,'L');
						$x =$x+$w[$j];
                	}
				}
	                
                // Add new page if no space is left // 
				$spaceLeft =  280 - $this->GetY() - $this->padding;
                if($spaceLeft < $yH && $totalRows > 0){
                	$this->AddPage();
                	$this->SetFillColor(0);
					$this->SetTextColor(255);
					$this->SetDrawColor(128,0,0);
					$this->SetLineWidth(.3);
					
					// Header
					foreach($header as $col)
						$this->Cell($widthRow,10,$col,'L',0,'',true);
					$this->ln();
					
					// Color and font restoration
					$this->SetFillColor(224,235,255);
					$this->SetTextColor(0);
					$this->SetFont('');
					$y = $this->GetY();
                }
                else {
                	$y=$y+$yH; //move to next row
                }
                $x=$x0; //start from first column
	        }
		}
		
		public function getTableRowHeight($row, $w)
		{
			$yH=$this->FontSize; //height of the row
			$temp = array();
			for($j = 0; $j < count($w) && isset($row[$j]); $j++)
			{
				$str_w = $this->GetStringWidth($row[$j]);
				$temp[] = (int) $str_w / $w[$j];
			}
			$m_str_w = max($temp);
			if($m_str_w > 1)
			{
				$yH *= $m_str_w;
			}
			$yH += $this->padding;
			return $yH;
		}
		
		// Page header
		function Header()
		{
		    // Logo
		    $this->Image('substockist.png',10,6,30);
		    // Arial bold 15
		    $this->SetFont('Arial','B',15);
		    // Move to the right
		    $this->Cell(80);
		    // Title
		    $this->Cell(210,10,'Report for '.$_POST["storeName"],0,0,'C');
		    // Line break
		    $this->Ln(20);
		}
		
		// Page footer
		function Footer()
		{
		    // Position at 1.5 cm from bottom
		    $this->SetY(-15);
		    // Arial italic 8
		    $this->SetFont('Arial','I',8);
		    // Page number
		    $this->Cell(0,10,'Page '.$this->PageNo(),0,0,'C');
		}
	
	}
	
	$pdf = new PDF('L','mm','A3');
	
	// Data loading
	$data = $_POST["data"];
	if(isset($_POST["headTable"]) && $_POST["headTable"] != ''){
		$headTable = $_POST["headTable"];
		$headTable = str_replace('"','',$headTable);
		$headTable = $pdf->LoadData($headTable);
		// Column headings
		$header1 = array();
		$header1 = $headTable[0];
		array_shift($headTable);
	}
	$storeName = $_POST["storeName"];

	$data = str_replace('"','',$data);
	$data = $pdf->LoadData($data);

	// Column headings
	$header = array();
	$header = $data[0];
	array_shift($data);
	
	$pdf->SetFont('Arial','',10);
	$pdf->AddPage();
	if(isset($headTable)){
		$pdf->SetAutoPageBreak(true);
		$pdf->BasicTable($header1,$headTable);
		$pdf->MultiCell(90,10,"\n",0,'L');
	}
	$pdf->SetAutoPageBreak(false);
	$pdf->BasicTable($header,$data);
	$pdf->MultiCell(90,10,"\n",0,'L');
	if(isset($_POST['multiple']) && $_POST['multiple'] > 1){
		$multiple = $_POST['multiple'];
		$multipleTable = json_decode($_POST['multipleData']);
		for($i = 2; $i <= $multiple; $i++){
			$tempData = $multipleTable[$i];
			$tempData = str_replace('"','',$tempData);
			$tempData = $pdf->LoadData($tempData);
		
			// Column headings
			$header = array();
			$header = $tempData[0];
			array_shift($tempData);
			
			$pdf->SetFont('Arial','',10);
			$pdf->BasicTable($header,$tempData);
			$pdf->MultiCell(90,10,"\n",0,'L');
		}
	}
	if(isset($_POST['fileName']))
		$filename = $_POST['fileName'].".pdf";
	else
		$filename = time().'.pdf';
	$pdf->Output($filename,'D');

?>
