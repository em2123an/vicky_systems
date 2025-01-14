-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               11.4.4-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for test
DROP DATABASE IF EXISTS `test`;
CREATE DATABASE IF NOT EXISTS `test` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `test`;

-- Dumping structure for table test.patients
DROP TABLE IF EXISTS `patients`;
CREATE TABLE IF NOT EXISTS `patients` (
  `patientid` bigint(20) NOT NULL AUTO_INCREMENT,
  `firstname` varchar(100) NOT NULL,
  `lastname` varchar(100) NOT NULL,
  `dob` date DEFAULT NULL,
  `phonenumber` varchar(100) NOT NULL,
  PRIMARY KEY (`patientid`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table test.patients: ~18 rows (approximately)
DELETE FROM `patients`;
INSERT INTO `patients` (`patientid`, `firstname`, `lastname`, `dob`, `phonenumber`) VALUES
	(1, 'eaf', 'ew', NULL, '32'),
	(2, 'jkjkl', 'lklkl', NULL, '997'),
	(3, 'eaf', 'lklkl', NULL, '997'),
	(4, 'eaf', 'lklkl', '1973-01-14', '997'),
	(5, 'eaf', 'lklkl', '1980-01-14', '997'),
	(6, 'lll', 'kkk', NULL, '890'),
	(7, 'eaf', 'vv', '1990-01-14', '654'),
	(8, 'dgg', 'ese', '1990-01-14', '997'),
	(9, 'eaf', 'asdfd', '1990-01-14', '654'),
	(10, 'eaf', 'asdfd', '1990-01-14', '654'),
	(11, 'eaf', 'asdfd', '1990-01-14', '654'),
	(12, 'eaf', 'asdfd', '1990-01-14', '654'),
	(13, 'eaf', 'asdfd', '1990-01-14', '654'),
	(14, 'eaf', 'asdfd', '1990-01-14', '654'),
	(15, 'sfs', 'asdfd', '1990-01-14', '654'),
	(16, 'sfs', 'asdfd', '1973-01-14', '32'),
	(17, 'sfs', 'ew', '1990-01-14', '654'),
	(18, 'dgg', 'asdfd', '1973-01-14', '997'),
	(19, 'eaf', 'lklkl', '1973-01-14', '997'),
	(20, 'eaf', 'lklkl', '1980-01-14', '997');

-- Dumping structure for table test.services
DROP TABLE IF EXISTS `services`;
CREATE TABLE IF NOT EXISTS `services` (
  `serviceid` bigint(20) NOT NULL AUTO_INCREMENT,
  `servicename` varchar(100) NOT NULL,
  `price` decimal(20,2) DEFAULT NULL,
  PRIMARY KEY (`serviceid`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table test.services: ~32 rows (approximately)
DELETE FROM `services`;
INSERT INTO `services` (`serviceid`, `servicename`, `price`) VALUES
	(1, 'Cervical MRI', 7800.00),
	(2, 'Thorasic MRI', 7800.00),
	(3, 'Lumbar MRI', 7800.00),
	(4, 'Brain MRI', 7800.00),
	(5, 'Pelvic MRI', 8800.00),
	(6, 'Abdominopelvic MRI', 11000.00),
	(7, 'Lt Shoulder MRI', 7400.00),
	(8, 'Rt Shoulder MRI', 7400.00),
	(9, 'Lt Elbow MRI', 7400.00),
	(10, 'Rt Elbow MRI', 7400.00),
	(11, 'Lt Wrist MRI', 7400.00),
	(12, 'Rt Wrist MRI', 7400.00),
	(13, 'Lt Hip MRI', 7400.00),
	(14, 'Rt Hip MRI', 7400.00),
	(15, 'Lt Knee MRI', 7400.00),
	(16, 'Rt Knee MRI', 7400.00),
	(17, 'Lt Ankle MRI', 7400.00),
	(18, 'Rt Ankle MRI', 7400.00),
	(19, 'Lt Foot MRI', 7400.00),
	(20, 'Rt Foot MRI', 7400.00),
	(21, 'Lt Leg MRI', 7400.00),
	(22, 'Rt Leg MRI', 7400.00),
	(23, 'Lt Thigh MRI', 7400.00),
	(24, 'Rt Thigh MRI', 7400.00),
	(25, 'Lt Hand MRI', 7400.00),
	(26, 'Rt Hand MRI', 7400.00),
	(27, 'Lt Arm MRI', 7400.00),
	(28, 'Rt Arm MRI', 7400.00),
	(29, 'Lt Forearm MRI', 7400.00),
	(30, 'Rt Forearm MRI', 7400.00),
	(31, 'Brain MRA', 8800.00),
	(32, 'Brain MRV', 8800.00);

-- Dumping structure for table test.visits
DROP TABLE IF EXISTS `visits`;
CREATE TABLE IF NOT EXISTS `visits` (
  `visitid` bigint(20) NOT NULL AUTO_INCREMENT,
  `patientid` bigint(20) NOT NULL,
  `scheduledatetime_start` datetime DEFAULT NULL,
  `scheduledatetime_end` datetime DEFAULT NULL,
  PRIMARY KEY (`visitid`),
  KEY `fk_pid` (`patientid`),
  CONSTRAINT `fk_pid` FOREIGN KEY (`patientid`) REFERENCES `patients` (`patientid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table test.visits: ~0 rows (approximately)
DELETE FROM `visits`;

-- Dumping structure for table test.visit_service_line
DROP TABLE IF EXISTS `visit_service_line`;
CREATE TABLE IF NOT EXISTS `visit_service_line` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `visitid` bigint(20) NOT NULL,
  `serviceid` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_visitid` (`visitid`),
  KEY `fk_serviceid` (`serviceid`),
  CONSTRAINT `fk_serviceid` FOREIGN KEY (`serviceid`) REFERENCES `services` (`serviceid`),
  CONSTRAINT `fk_visitid` FOREIGN KEY (`visitid`) REFERENCES `visits` (`visitid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table test.visit_service_line: ~0 rows (approximately)
DELETE FROM `visit_service_line`;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
