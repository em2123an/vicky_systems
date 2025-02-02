-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               10.10.3-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             11.3.0.6295
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for test
DROP DATABASE IF EXISTS `test`;
CREATE DATABASE IF NOT EXISTS `test` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `test`;

-- Dumping structure for table test.discounters
DROP TABLE IF EXISTS `discounters`;
CREATE TABLE IF NOT EXISTS `discounters` (
  `discounterid` int(11) unsigned NOT NULL,
  `firstname` varchar(200) DEFAULT NULL,
  `lastname` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`discounterid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data exporting was unselected.

-- Dumping structure for table test.invoices
DROP TABLE IF EXISTS `invoices`;
CREATE TABLE IF NOT EXISTS `invoices` (
  `invoiceid` int(11) unsigned NOT NULL,
  `visitid` int(11) unsigned NOT NULL,
  `casherid` int(11) unsigned DEFAULT NULL,
  `createdat` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`invoiceid`),
  UNIQUE KEY `visitid` (`visitid`),
  KEY `fk_patient_inv` (`visitid`) USING BTREE,
  CONSTRAINT `fk_visit_inv` FOREIGN KEY (`visitid`) REFERENCES `visits` (`visitid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data exporting was unselected.

-- Dumping structure for table test.invoice_service_line
DROP TABLE IF EXISTS `invoice_service_line`;
CREATE TABLE IF NOT EXISTS `invoice_service_line` (
  `invoiceid` int(11) unsigned NOT NULL,
  `serviceid` int(11) unsigned NOT NULL,
  `discounterid` int(11) unsigned DEFAULT NULL,
  `discountpercent` decimal(6,2) DEFAULT NULL,
  PRIMARY KEY (`invoiceid`,`serviceid`),
  KEY `fk_service_invline` (`serviceid`),
  KEY `fk_discounter_invline` (`discounterid`),
  CONSTRAINT `fk_discounter_invline` FOREIGN KEY (`discounterid`) REFERENCES `discounters` (`discounterid`),
  CONSTRAINT `fk_invoice_invline` FOREIGN KEY (`invoiceid`) REFERENCES `invoices` (`invoiceid`),
  CONSTRAINT `fk_service_invline` FOREIGN KEY (`serviceid`) REFERENCES `services` (`serviceid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data exporting was unselected.

-- Dumping structure for table test.patients
DROP TABLE IF EXISTS `patients`;
CREATE TABLE IF NOT EXISTS `patients` (
  `patientid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `firstname` varchar(100) NOT NULL,
  `lastname` varchar(100) NOT NULL,
  `sex` varchar(100) NOT NULL,
  `dob` date DEFAULT NULL,
  `phonenumber` varchar(100) NOT NULL,
  PRIMARY KEY (`patientid`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data exporting was unselected.

-- Dumping structure for table test.payments
DROP TABLE IF EXISTS `payments`;
CREATE TABLE IF NOT EXISTS `payments` (
  `paymentid` int(11) NOT NULL,
  `invoiceid` int(11) unsigned NOT NULL,
  `paymenttype` varchar(20) NOT NULL,
  `paymentamount` decimal(20,2) NOT NULL,
  `casherid` int(11) unsigned DEFAULT NULL,
  `recievedat` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`paymentid`),
  KEY `fk_invoice_payment` (`invoiceid`),
  CONSTRAINT `fk_invoice_payment` FOREIGN KEY (`invoiceid`) REFERENCES `invoices` (`invoiceid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data exporting was unselected.

-- Dumping structure for table test.services
DROP TABLE IF EXISTS `services`;
CREATE TABLE IF NOT EXISTS `services` (
  `serviceid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `servicename` varchar(100) NOT NULL,
  `price` decimal(20,2) DEFAULT NULL,
  PRIMARY KEY (`serviceid`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data exporting was unselected.

-- Dumping structure for table test.visits
DROP TABLE IF EXISTS `visits`;
CREATE TABLE IF NOT EXISTS `visits` (
  `visitid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `patientid` int(10) unsigned NOT NULL,
  `scheduledatetime_start` datetime DEFAULT NULL,
  `scheduledatetime_end` datetime DEFAULT NULL,
  `fileuploads` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`fileuploads`)),
  PRIMARY KEY (`visitid`),
  KEY `fk_pid` (`patientid`),
  CONSTRAINT `fk_pid` FOREIGN KEY (`patientid`) REFERENCES `patients` (`patientid`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data exporting was unselected.

-- Dumping structure for table test.visit_service_line
DROP TABLE IF EXISTS `visit_service_line`;
CREATE TABLE IF NOT EXISTS `visit_service_line` (
  `visitserviceid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `visitid` int(10) unsigned NOT NULL,
  `serviceid` int(10) unsigned NOT NULL,
  PRIMARY KEY (`visitserviceid`) USING BTREE,
  KEY `fk_serviceid` (`serviceid`),
  KEY `fk_vid` (`visitid`),
  CONSTRAINT `fk_serviceid` FOREIGN KEY (`serviceid`) REFERENCES `services` (`serviceid`),
  CONSTRAINT `fk_vid` FOREIGN KEY (`visitid`) REFERENCES `visits` (`visitid`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data exporting was unselected.

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
