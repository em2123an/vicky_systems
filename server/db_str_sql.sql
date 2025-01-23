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
  `patientid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `firstname` varchar(100) NOT NULL,
  `lastname` varchar(100) NOT NULL,
  `sex` varchar(100) NOT NULL,
  `dob` date DEFAULT NULL,
  `phonenumber` varchar(100) NOT NULL,
  PRIMARY KEY (`patientid`)
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table test.patients: ~32 rows (approximately)
DELETE FROM `patients`;
INSERT INTO `patients` (`patientid`, `firstname`, `lastname`, `sex`, `dob`, `phonenumber`) VALUES
	(1, 'eaf', 'ew', 'Male', NULL, '32'),
	(2, 'jkjkl', 'lklkl', 'Male', NULL, '997'),
	(3, 'eaf', 'lklkl', 'Male', NULL, '997'),
	(4, 'eaf', 'lklkl', 'Male', '1973-01-14', '997'),
	(5, 'eaf', 'lklkl', 'Male', '1980-01-14', '997'),
	(6, 'lll', 'kkk', 'Male', NULL, '890'),
	(7, 'eaf', 'vv', 'Male', '1990-01-14', '654'),
	(8, 'dgg', 'ese', 'Male', '1990-01-14', '997'),
	(9, 'eaf', 'asdfd', 'Male', '1990-01-14', '654'),
	(10, 'eaf', 'asdfd', 'Male', '1990-01-14', '654'),
	(11, 'eaf', 'asdfd', 'Male', '1990-01-14', '654'),
	(12, 'eaf', 'asdfd', 'Male', '1990-01-14', '654'),
	(13, 'eaf', 'asdfd', 'Male', '1990-01-14', '654'),
	(14, 'eaf', 'asdfd', 'Male', '1990-01-14', '654'),
	(15, 'sfs', 'asdfd', 'Male', '1990-01-14', '654'),
	(16, 'sfs', 'asdfd', 'Male', '1973-01-14', '32'),
	(17, 'sfs', 'ew', 'Male', '1990-01-14', '654'),
	(18, 'dgg', 'asdfd', 'Male', '1973-01-14', '997'),
	(19, 'eaf', 'lklkl', 'Male', '1973-01-14', '997'),
	(20, 'eaf', 'lklkl', 'Male', '1980-01-14', '997'),
	(24, 'eaf', 'lklkl', 'Male', '1973-01-18', '997'),
	(37, 'eaf', 'asdfd', 'Male', '1983-01-22', '912546'),
	(38, 'eaf', 'asdfd', 'Male', '1973-01-22', '997'),
	(39, 'eaf', 'asdfd', 'Male', '1980-01-22', '9'),
	(40, 'eaf', 'vv', 'Male', '1980-01-22', '654'),
	(41, 'dgg', 'vv', 'Male', '1990-01-22', '997'),
	(42, 'eaf', 'lklkl', 'Male', '1973-01-22', '997'),
	(43, 'sfs', 'ew', 'Male', '1973-01-22', '997'),
	(44, 'sfs', 'ew', 'Male', '1980-01-22', '997'),
	(45, 'eaf', 'lklkl', 'Male', '1990-01-22', '997'),
	(46, 'dgg', 'asdfd', 'Male', '1980-01-23', '99'),
	(47, 'sfs', 'asdfd', 'Male', '1980-01-23', '997');

-- Dumping structure for table test.services
DROP TABLE IF EXISTS `services`;
CREATE TABLE IF NOT EXISTS `services` (
  `serviceid` int(10) unsigned NOT NULL AUTO_INCREMENT,
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
	(6, 'Abdominopelvic MRI', 11800.00),
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
  `visitid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `patientid` int(10) unsigned NOT NULL,
  `scheduledatetime_start` datetime DEFAULT NULL,
  `scheduledatetime_end` datetime DEFAULT NULL,
  PRIMARY KEY (`visitid`),
  KEY `fk_pid` (`patientid`),
  CONSTRAINT `fk_pid` FOREIGN KEY (`patientid`) REFERENCES `patients` (`patientid`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table test.visits: ~12 rows (approximately)
DELETE FROM `visits`;
INSERT INTO `visits` (`visitid`, `patientid`, `scheduledatetime_start`, `scheduledatetime_end`) VALUES
	(1, 24, '2025-01-18 06:40:00', '2025-01-18 07:00:00'),
	(14, 37, '2025-01-22 11:20:00', '2025-01-22 11:40:00'),
	(15, 38, '2025-01-22 12:20:00', '2025-01-22 12:40:00'),
	(16, 39, '2025-01-22 13:20:00', '2025-01-22 13:40:00'),
	(17, 40, '2025-01-22 14:20:00', '2025-01-22 14:40:00'),
	(18, 41, '2025-01-22 14:40:00', '2025-01-22 15:00:00'),
	(19, 42, '2025-01-22 11:20:00', '2025-01-22 11:40:00'),
	(20, 43, '2025-01-22 13:00:00', '2025-01-22 13:40:00'),
	(21, 44, '2025-01-22 13:40:00', '2025-01-22 14:20:00'),
	(22, 45, '2025-01-22 13:40:00', '2025-01-22 14:00:00'),
	(23, 46, '2025-01-23 09:20:00', '2025-01-23 10:00:00'),
	(24, 47, '2025-01-23 12:20:00', '2025-01-23 13:00:00');

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
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table test.visit_service_line: ~19 rows (approximately)
DELETE FROM `visit_service_line`;
INSERT INTO `visit_service_line` (`visitserviceid`, `visitid`, `serviceid`) VALUES
	(1, 14, 1),
	(2, 15, 5),
	(3, 15, 2),
	(4, 15, 3),
	(5, 16, 7),
	(6, 16, 4),
	(7, 17, 9),
	(8, 17, 5),
	(9, 18, 8),
	(10, 19, 2),
	(11, 19, 9),
	(12, 20, 2),
	(13, 21, 1),
	(14, 21, 2),
	(15, 22, 4),
	(16, 22, 7),
	(17, 23, 8),
	(18, 24, 1),
	(19, 24, 8);

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
