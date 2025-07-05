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

-- Dumping structure for table test.accounts
DROP TABLE IF EXISTS `accounts`;
CREATE TABLE IF NOT EXISTS `accounts` (
  `accountid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `userid` int(10) unsigned NOT NULL,
  `username` varchar(50) NOT NULL DEFAULT '',
  `password_hash` varchar(250) NOT NULL DEFAULT '',
  `roleid` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`accountid`) USING BTREE,
  UNIQUE KEY `userid` (`userid`),
  KEY `fk_roles_roleid` (`roleid`),
  KEY `username` (`username`) USING BTREE,
  CONSTRAINT `fk_roles_roleid` FOREIGN KEY (`roleid`) REFERENCES `roles` (`roleid`) ON DELETE SET NULL ON UPDATE SET NULL,
  CONSTRAINT `fk_users_userid` FOREIGN KEY (`userid`) REFERENCES `users` (`userid`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table test.accounts: ~2 rows (approximately)
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
INSERT INTO `accounts` (`accountid`, `userid`, `username`, `password_hash`, `roleid`) VALUES
	(1, 1, 'eman', '&ema&', 1),
	(2, 3, 'marrr', '&mar&', 2);
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;

-- Dumping structure for table test.allowed_activities
DROP TABLE IF EXISTS `allowed_activities`;
CREATE TABLE IF NOT EXISTS `allowed_activities` (
  `activityid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `activityname` varchar(50) NOT NULL,
  PRIMARY KEY (`activityid`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table test.allowed_activities: ~8 rows (approximately)
/*!40000 ALTER TABLE `allowed_activities` DISABLE KEYS */;
INSERT INTO `allowed_activities` (`activityid`, `activityname`) VALUES
	(1, 'create_mwl'),
	(2, 'update_mwl'),
	(3, 'make_appt'),
	(4, 'edit_appt'),
	(5, 'make_paym'),
	(6, 'create_report'),
	(7, 'edit_report'),
	(8, 'view_report'),
	(9, 'view_image'),
	(10, 'edit_scan_status');
/*!40000 ALTER TABLE `allowed_activities` ENABLE KEYS */;

-- Dumping structure for table test.discounters
DROP TABLE IF EXISTS `discounters`;
CREATE TABLE IF NOT EXISTS `discounters` (
  `discounterid` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `firstname` varchar(200) DEFAULT NULL,
  `lastname` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`discounterid`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table test.discounters: ~2 rows (approximately)
/*!40000 ALTER TABLE `discounters` DISABLE KEYS */;
INSERT INTO `discounters` (`discounterid`, `firstname`, `lastname`) VALUES
	(1, 'Dr. E', 'S'),
	(2, 'RE', 'FQ');
/*!40000 ALTER TABLE `discounters` ENABLE KEYS */;

-- Dumping structure for table test.invoices
DROP TABLE IF EXISTS `invoices`;
CREATE TABLE IF NOT EXISTS `invoices` (
  `invoiceid` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `visitid` int(11) unsigned NOT NULL,
  `casherid` int(11) unsigned DEFAULT NULL,
  `createdat` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`invoiceid`),
  UNIQUE KEY `visitid` (`visitid`),
  KEY `fk_patient_inv` (`visitid`) USING BTREE,
  CONSTRAINT `fk_visit_inv` FOREIGN KEY (`visitid`) REFERENCES `visits` (`visitid`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table test.invoices: ~76 rows (approximately)
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
INSERT INTO `invoices` (`invoiceid`, `visitid`, `casherid`, `createdat`) VALUES
	(3, 33, NULL, '2025-05-31 14:08:50'),
	(4, 34, NULL, '2025-05-31 19:00:02'),
	(5, 35, NULL, '2025-05-31 19:00:36'),
	(6, 36, NULL, '2025-05-31 19:06:25'),
	(7, 37, NULL, '2025-06-05 10:13:12'),
	(8, 38, NULL, '2025-06-05 12:12:24'),
	(9, 39, NULL, '2025-06-05 12:16:38'),
	(10, 40, NULL, '2025-06-05 12:22:24'),
	(11, 41, NULL, '2025-06-05 12:23:09'),
	(12, 42, NULL, '2025-06-05 12:58:57'),
	(14, 44, NULL, '2025-06-05 13:09:15'),
	(15, 45, NULL, '2025-06-05 15:15:51'),
	(16, 46, NULL, '2025-06-05 16:32:55'),
	(17, 47, NULL, '2025-06-05 16:35:24'),
	(18, 48, NULL, '2025-06-06 10:37:08'),
	(19, 49, NULL, '2025-06-06 11:53:58'),
	(20, 50, NULL, '2025-06-06 11:56:40'),
	(21, 51, NULL, '2025-06-06 12:41:44'),
	(22, 52, NULL, '2025-06-06 12:42:00'),
	(23, 53, NULL, '2025-06-06 12:43:20'),
	(24, 54, NULL, '2025-06-06 12:48:06'),
	(25, 55, NULL, '2025-06-06 12:52:08'),
	(26, 56, NULL, '2025-06-06 12:58:16'),
	(27, 57, NULL, '2025-06-06 13:03:41'),
	(28, 58, NULL, '2025-06-06 13:11:36'),
	(29, 59, NULL, '2025-06-06 13:12:36'),
	(30, 60, NULL, '2025-06-06 13:20:11'),
	(31, 61, NULL, '2025-06-06 13:43:14'),
	(32, 62, NULL, '2025-06-06 14:01:26'),
	(33, 63, NULL, '2025-06-06 14:06:12'),
	(34, 64, NULL, '2025-06-06 14:07:27'),
	(35, 65, NULL, '2025-06-06 14:09:43'),
	(36, 66, NULL, '2025-06-06 14:10:17'),
	(37, 67, NULL, '2025-06-06 14:10:59'),
	(38, 68, NULL, '2025-06-06 14:11:34'),
	(39, 69, NULL, '2025-06-06 14:13:11'),
	(40, 70, NULL, '2025-06-06 14:14:38'),
	(41, 71, NULL, '2025-06-06 14:16:22'),
	(42, 72, NULL, '2025-06-06 14:18:22'),
	(43, 73, NULL, '2025-06-06 14:39:11'),
	(44, 74, NULL, '2025-06-06 14:40:21'),
	(45, 75, NULL, '2025-06-06 14:42:45'),
	(46, 76, NULL, '2025-06-06 14:44:36'),
	(47, 77, NULL, '2025-06-06 14:45:51'),
	(48, 78, NULL, '2025-06-06 14:47:49'),
	(49, 79, NULL, '2025-06-06 14:50:06'),
	(50, 80, NULL, '2025-06-06 14:51:15'),
	(51, 81, NULL, '2025-06-06 15:23:07'),
	(52, 82, NULL, '2025-06-06 15:26:13'),
	(53, 83, NULL, '2025-06-06 16:50:05'),
	(54, 84, NULL, '2025-06-06 16:53:02'),
	(55, 85, NULL, '2025-06-06 17:09:43'),
	(56, 86, NULL, '2025-06-06 17:23:59'),
	(57, 87, NULL, '2025-06-06 17:26:11'),
	(58, 88, NULL, '2025-06-06 17:28:00'),
	(59, 89, NULL, '2025-06-06 17:29:18'),
	(60, 90, NULL, '2025-06-06 17:30:10'),
	(61, 91, NULL, '2025-06-06 17:32:49'),
	(62, 92, NULL, '2025-06-06 17:37:59'),
	(63, 93, NULL, '2025-06-06 17:39:02'),
	(64, 94, NULL, '2025-06-06 17:49:19'),
	(65, 95, NULL, '2025-06-06 18:02:03'),
	(66, 96, NULL, '2025-06-06 18:04:59'),
	(67, 97, NULL, '2025-06-06 18:06:47'),
	(68, 98, NULL, '2025-06-06 18:08:02'),
	(69, 99, NULL, '2025-06-06 18:20:41'),
	(70, 100, NULL, '2025-06-06 18:25:58'),
	(71, 101, NULL, '2025-06-06 18:26:29'),
	(72, 102, NULL, '2025-06-06 18:35:11'),
	(73, 103, NULL, '2025-06-06 19:10:24'),
	(74, 104, NULL, '2025-06-06 19:11:08'),
	(75, 105, NULL, '2025-06-06 19:14:36'),
	(76, 106, NULL, '2025-06-06 20:05:17'),
	(77, 107, NULL, '2025-06-06 20:06:53'),
	(78, 108, NULL, '2025-06-06 20:32:58'),
	(79, 109, NULL, '2025-06-06 20:44:56'),
	(80, 110, NULL, '2025-06-06 20:48:22'),
	(81, 111, NULL, '2025-06-06 20:50:14'),
	(82, 112, NULL, '2025-06-06 20:53:42'),
	(83, 113, NULL, '2025-06-06 21:00:35'),
	(84, 114, NULL, '2025-06-06 21:02:59'),
	(85, 115, NULL, '2025-06-06 21:09:42'),
	(86, 116, NULL, '2025-06-06 21:12:39'),
	(87, 117, NULL, '2025-06-06 22:15:33'),
	(88, 118, NULL, '2025-06-08 14:56:04'),
	(89, 119, NULL, '2025-06-08 14:59:16'),
	(90, 120, NULL, '2025-06-08 15:33:13'),
	(91, 121, NULL, '2025-06-08 15:39:59'),
	(92, 122, NULL, '2025-06-08 15:41:34'),
	(93, 123, NULL, '2025-06-08 15:45:18'),
	(94, 124, NULL, '2025-06-08 15:51:22'),
	(95, 125, NULL, '2025-06-08 15:53:49'),
	(97, 127, NULL, '2025-06-16 18:07:23'),
	(98, 128, NULL, '2025-06-17 18:58:03'),
	(99, 129, NULL, '2025-06-20 17:00:35'),
	(100, 130, NULL, '2025-06-20 17:47:59');
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;

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
  KEY `composite_invid_servid` (`invoiceid`,`serviceid`),
  KEY `composite_invid_disid` (`invoiceid`,`discounterid`),
  CONSTRAINT `fk_discounter_invline` FOREIGN KEY (`discounterid`) REFERENCES `discounters` (`discounterid`),
  CONSTRAINT `fk_invoice_invline` FOREIGN KEY (`invoiceid`) REFERENCES `invoices` (`invoiceid`),
  CONSTRAINT `fk_service_invline` FOREIGN KEY (`serviceid`) REFERENCES `services` (`serviceid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table test.invoice_service_line: ~95 rows (approximately)
/*!40000 ALTER TABLE `invoice_service_line` DISABLE KEYS */;
INSERT INTO `invoice_service_line` (`invoiceid`, `serviceid`, `discounterid`, `discountpercent`) VALUES
	(3, 66, 2, 25.00),
	(4, 34, NULL, NULL),
	(5, 106, NULL, NULL),
	(6, 155, NULL, NULL),
	(7, 80, NULL, NULL),
	(8, 113, NULL, NULL),
	(9, 113, NULL, NULL),
	(10, 113, NULL, NULL),
	(11, 113, NULL, NULL),
	(12, 82, NULL, NULL),
	(14, 147, NULL, NULL),
	(15, 147, NULL, NULL),
	(16, 95, NULL, NULL),
	(17, 149, NULL, NULL),
	(18, 147, NULL, NULL),
	(19, 147, NULL, NULL),
	(20, 147, NULL, NULL),
	(21, 151, NULL, NULL),
	(22, 151, NULL, NULL),
	(23, 151, NULL, NULL),
	(24, 151, NULL, NULL),
	(25, 151, NULL, NULL),
	(26, 151, NULL, NULL),
	(27, 151, NULL, NULL),
	(28, 151, NULL, NULL),
	(29, 151, NULL, NULL),
	(30, 151, NULL, NULL),
	(31, 114, NULL, NULL),
	(32, 111, NULL, NULL),
	(33, 111, NULL, NULL),
	(34, 111, NULL, NULL),
	(35, 80, NULL, NULL),
	(36, 80, NULL, NULL),
	(37, 80, NULL, NULL),
	(38, 80, NULL, NULL),
	(39, 80, NULL, NULL),
	(40, 80, NULL, NULL),
	(41, 80, NULL, NULL),
	(42, 80, NULL, NULL),
	(43, 80, NULL, NULL),
	(44, 80, NULL, NULL),
	(45, 80, NULL, NULL),
	(46, 80, NULL, NULL),
	(47, 80, NULL, NULL),
	(48, 80, NULL, NULL),
	(49, 80, NULL, NULL),
	(50, 80, NULL, NULL),
	(51, 80, NULL, NULL),
	(52, 80, NULL, NULL),
	(53, 80, NULL, NULL),
	(54, 80, NULL, NULL),
	(55, 80, NULL, NULL),
	(56, 80, NULL, NULL),
	(57, 80, NULL, NULL),
	(58, 80, NULL, NULL),
	(59, 80, NULL, NULL),
	(60, 80, NULL, NULL),
	(61, 80, NULL, NULL),
	(62, 80, NULL, NULL),
	(63, 80, NULL, NULL),
	(64, 80, NULL, NULL),
	(65, 80, NULL, NULL),
	(66, 80, NULL, NULL),
	(67, 80, NULL, NULL),
	(68, 80, NULL, NULL),
	(69, 80, NULL, NULL),
	(70, 80, NULL, NULL),
	(71, 80, NULL, NULL),
	(72, 80, NULL, NULL),
	(73, 80, NULL, NULL),
	(74, 80, NULL, NULL),
	(75, 80, NULL, NULL),
	(76, 80, NULL, NULL),
	(77, 80, NULL, NULL),
	(78, 80, NULL, NULL),
	(79, 80, NULL, NULL),
	(80, 80, NULL, NULL),
	(81, 80, NULL, NULL),
	(82, 80, NULL, NULL),
	(83, 80, NULL, NULL),
	(84, 80, NULL, NULL),
	(85, 80, NULL, NULL),
	(86, 80, NULL, NULL),
	(87, 80, NULL, NULL),
	(88, 147, NULL, NULL),
	(89, 147, NULL, NULL),
	(90, 81, NULL, NULL),
	(91, 82, NULL, NULL),
	(92, 82, NULL, NULL),
	(93, 82, NULL, NULL),
	(94, 82, NULL, NULL),
	(95, 82, NULL, NULL),
	(97, 82, NULL, NULL),
	(98, 79, NULL, NULL),
	(98, 147, NULL, NULL),
	(99, 82, NULL, NULL),
	(99, 112, NULL, NULL),
	(100, 110, NULL, NULL);
/*!40000 ALTER TABLE `invoice_service_line` ENABLE KEYS */;

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
) ENGINE=InnoDB AUTO_INCREMENT=154 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table test.patients: ~76 rows (approximately)
/*!40000 ALTER TABLE `patients` DISABLE KEYS */;
INSERT INTO `patients` (`patientid`, `firstname`, `lastname`, `sex`, `dob`, `phonenumber`) VALUES
	(56, 'sers', 'asfd', 'Male', '1983-05-31', '66632'),
	(57, 'wew', 'sfs', 'Female', '1973-05-31', '85445'),
	(58, 'njkjk', 'njkll', 'Male', '2002-05-31', '23332'),
	(59, 'njkjk', 'njkll', 'Female', '1951-05-31', '85445'),
	(60, 'hkhkj', 'kkk', 'Female', '2001-06-05', '9866'),
	(61, 'bref', 'sefs', 'Female', '2003-06-05', '232443'),
	(62, 'bref', 'sefs', 'Female', '2003-06-05', '232443'),
	(63, 'bref', 'sefs', 'Female', '2003-06-05', '232443'),
	(64, 'bref', 'sefs', 'Female', '2003-06-05', '232443'),
	(65, 'aeafe', 'sfe', 'Female', '1980-06-05', '25688'),
	(67, 'fd', 'ijioijoi', 'Female', '1983-06-05', '23332'),
	(68, 'fd', 'njkll', 'Female', '2002-06-05', '23332'),
	(69, 'sdjll', 'opkk', 'Male', '2002-06-05', '85445'),
	(70, 'dfstst', 'klkl', 'Male', '1945-06-05', '52566'),
	(71, 'seaf', 'afds', 'Male', '2002-06-06', '9866'),
	(72, 'seaf', 'afds', 'Male', '2002-06-06', '9866'),
	(73, 'seaf', 'afds', 'Male', '2002-06-06', '9866'),
	(74, 'njkjk', 'uhihu', 'Female', '2002-06-06', '23332'),
	(75, 'njkjk', 'uhihu', 'Female', '2002-06-06', '23332'),
	(76, 'njkjk', 'uhihu', 'Female', '2002-06-06', '23332'),
	(77, 'njkjk', 'uhihu', 'Female', '2002-06-06', '23332'),
	(78, 'njkjk', 'uhihu', 'Female', '2002-06-06', '23332'),
	(79, 'njkjk', 'uhihu', 'Female', '2002-06-06', '23332'),
	(80, 'njkjk', 'uhihu', 'Female', '2002-06-06', '23332'),
	(81, 'njkjk', 'uhihu', 'Female', '2002-06-06', '23332'),
	(82, 'njkjk', 'uhihu', 'Female', '2002-06-06', '23332'),
	(83, 'njkjk', 'uhihu', 'Female', '2002-06-06', '23332'),
	(84, 'Eman', 'Shif', 'Male', '1563-10-06', '85445'),
	(85, 'fd', 'sfs', 'Male', '1983-06-06', '23332'),
	(86, 'fd', 'sfs', 'Male', '1983-06-06', '23332'),
	(87, 'fd', 'sfs', 'Male', '1983-06-06', '23332'),
	(88, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(89, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(90, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(91, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(92, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(93, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(94, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(95, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(96, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(97, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(98, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(99, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(100, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(101, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(102, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(103, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(104, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(105, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(106, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(107, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(108, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(109, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(110, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(111, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(112, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(113, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(114, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(115, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(116, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(117, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(118, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(119, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(120, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(121, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(122, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(123, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(124, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(125, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(126, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(127, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(128, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(129, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(130, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(131, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(132, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(133, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(134, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(135, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(136, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(137, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(138, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(139, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(140, 'fd', 'ijioijoi', 'Male', '1983-06-06', '23332'),
	(141, 'fd', 'njkll', 'Male', '2002-06-08', '23332'),
	(142, 'fd', 'njkll', 'Male', '2002-06-08', '23332'),
	(143, 'fd', 'njkll', 'Female', '2002-06-08', '85445'),
	(144, 'njkjk', 'ijioijoi', 'Male', '1983-06-08', '23332'),
	(145, 'njkjk', 'ijioijoi', 'Male', '1983-06-08', '23332'),
	(146, 'njkjk', 'ijioijoi', 'Male', '1983-06-08', '23332'),
	(147, 'njkjk', 'ijioijoi', 'Male', '1983-06-08', '23332'),
	(148, 'njkjk', 'ijioijoi', 'Male', '1983-06-08', '23332'),
	(150, 'fd', 'sfs', 'Female', '2002-06-16', '85445'),
	(151, 'sflf', 'sdss', 'Female', '1980-06-17', '12000'),
	(152, 'sd', 'njkll', 'Female', '2002-06-20', '23332'),
	(153, 'njkjk', 'Shifew', 'Female', '1951-06-20', '232443');
/*!40000 ALTER TABLE `patients` ENABLE KEYS */;

-- Dumping structure for table test.payments
DROP TABLE IF EXISTS `payments`;
CREATE TABLE IF NOT EXISTS `payments` (
  `paymentid` int(11) NOT NULL AUTO_INCREMENT,
  `invoiceid` int(11) unsigned NOT NULL,
  `paymenttype` varchar(20) NOT NULL,
  `paymentamount` decimal(20,2) NOT NULL,
  `casherid` int(11) unsigned DEFAULT NULL,
  `recievedat` timestamp NULL DEFAULT current_timestamp(),
  `remark` mediumtext DEFAULT NULL,
  PRIMARY KEY (`paymentid`),
  KEY `fk_invoice_payment` (`invoiceid`),
  CONSTRAINT `fk_invoice_payment` FOREIGN KEY (`invoiceid`) REFERENCES `invoices` (`invoiceid`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table test.payments: ~0 rows (approximately)
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` (`paymentid`, `invoiceid`, `paymenttype`, `paymentamount`, `casherid`, `recievedat`, `remark`) VALUES
	(1, 3, 'CASH', 1400.00, NULL, '2025-05-31 14:08:50', NULL);
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;

-- Dumping structure for table test.roles
DROP TABLE IF EXISTS `roles`;
CREATE TABLE IF NOT EXISTS `roles` (
  `roleid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `rolename` varchar(50) NOT NULL,
  PRIMARY KEY (`roleid`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table test.roles: ~4 rows (approximately)
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` (`roleid`, `rolename`) VALUES
	(1, 'Admin'),
	(2, 'Reception'),
	(3, 'Cashier'),
	(4, 'Technologist'),
	(5, 'Radiologist');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;

-- Dumping structure for table test.role_allowed_activities
DROP TABLE IF EXISTS `role_allowed_activities`;
CREATE TABLE IF NOT EXISTS `role_allowed_activities` (
  `roleallowedactivityid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `roleid` int(10) unsigned NOT NULL,
  `allowedactivityid` int(10) unsigned NOT NULL,
  PRIMARY KEY (`roleallowedactivityid`),
  KEY `fk_allowedactivity_roleallowedactivities` (`allowedactivityid`),
  KEY `composite_roleid_raaid` (`roleid`,`allowedactivityid`) USING BTREE,
  CONSTRAINT `fk_allowedactivity_roleallowedactivities` FOREIGN KEY (`allowedactivityid`) REFERENCES `allowed_activities` (`activityid`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_role_roleallowedactivities` FOREIGN KEY (`roleid`) REFERENCES `roles` (`roleid`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table test.role_allowed_activities: ~3 rows (approximately)
/*!40000 ALTER TABLE `role_allowed_activities` DISABLE KEYS */;
INSERT INTO `role_allowed_activities` (`roleallowedactivityid`, `roleid`, `allowedactivityid`) VALUES
	(1, 1, 1),
	(2, 1, 2),
	(3, 1, 3);
/*!40000 ALTER TABLE `role_allowed_activities` ENABLE KEYS */;

-- Dumping structure for table test.services
DROP TABLE IF EXISTS `services`;
CREATE TABLE IF NOT EXISTS `services` (
  `serviceid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `servicename` varchar(100) NOT NULL,
  `price` decimal(20,2) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`serviceid`)
) ENGINE=InnoDB AUTO_INCREMENT=158 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table test.services: ~108 rows (approximately)
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` (`serviceid`, `servicename`, `price`, `category`) VALUES
	(33, 'Brain MRI', 7800.00, 'MR'),
	(34, 'Brain MRA', 8800.00, 'MR'),
	(35, 'Brain MRV', 8800.00, 'MR'),
	(36, 'Pelvic MRI', 8800.00, 'MR'),
	(37, 'MRCP', 8800.00, 'MR'),
	(38, 'Abdominal MRI', 9200.00, 'MR'),
	(39, 'Abdominopelvic MRI', 11000.00, 'MR'),
	(40, 'Cervical MRI', 7800.00, 'MR'),
	(41, 'Lumbar MRI', 7800.00, 'MR'),
	(42, 'Thorasic MRI', 7800.00, 'MR'),
	(43, 'Lt Hand MRI', 7400.00, 'MR'),
	(44, 'Lt Wrist MRI', 7400.00, 'MR'),
	(45, 'Lt Forearm MRI', 7400.00, 'MR'),
	(46, 'Lt Elbow MRI', 7400.00, 'MR'),
	(47, 'Lt Arm MRI', 7400.00, 'MR'),
	(48, 'Lt Shoulder MRI', 7400.00, 'MR'),
	(49, 'Lt Hip MRI', 7400.00, 'MR'),
	(50, 'Lt Thigh MRI', 7400.00, 'MR'),
	(51, 'Lt Knee MRI', 7400.00, 'MR'),
	(52, 'Lt Leg MRI', 7400.00, 'MR'),
	(53, 'Lt Ankle MRI', 7400.00, 'MR'),
	(54, 'Lt Foot MRI', 7400.00, 'MR'),
	(55, 'Neck MRI', 7400.00, 'MR'),
	(56, 'Cardaic MRI', 7400.00, 'MR'),
	(57, 'Chest MRI', 7400.00, 'MR'),
	(58, 'Penile MRI', 7400.00, 'MR'),
	(59, 'Scrotal MRI', 7400.00, 'MR'),
	(60, 'Rt Hand MRI', 7400.00, 'MR'),
	(61, 'Rt Wrist MRI', 7400.00, 'MR'),
	(62, 'Rt Forearm MRI', 7400.00, 'MR'),
	(63, 'Rt Elbow MRI', 7400.00, 'MR'),
	(64, 'Rt Arm MRI', 7400.00, 'MR'),
	(65, 'Rt Shoulder MRI', 7400.00, 'MR'),
	(66, 'Rt Hip MRI', 7400.00, 'MR'),
	(67, 'Rt Thigh MRI', 7400.00, 'MR'),
	(68, 'Rt Knee MRI', 7400.00, 'MR'),
	(69, 'Rt Leg MRI', 7400.00, 'MR'),
	(70, 'Rt Ankle MRI', 7400.00, 'MR'),
	(71, 'Rt Foot MRI', 7400.00, 'MR'),
	(75, 'Lt Hand CT', 5400.00, 'CT'),
	(76, 'Lt Wrist CT', 5400.00, 'CT'),
	(77, 'Lt Forearm CT', 5400.00, 'CT'),
	(78, 'Lt Elbow CT', 5400.00, 'CT'),
	(79, 'Lt Arm CT', 5400.00, 'CT'),
	(80, 'Lt Shoulder CT', 5400.00, 'CT'),
	(81, 'Lt Hip CT', 5400.00, 'CT'),
	(82, 'Lt Thigh CT', 5400.00, 'CT'),
	(83, 'Lt Knee CT', 5400.00, 'CT'),
	(84, 'Lt Leg CT', 5400.00, 'CT'),
	(85, 'Lt Ankle CT', 5400.00, 'CT'),
	(86, 'Lt Foot CT', 5400.00, 'CT'),
	(87, 'Rt Hand CT', 5400.00, 'CT'),
	(88, 'Rt Wrist CT', 5400.00, 'CT'),
	(89, 'Rt Forearm CT', 5400.00, 'CT'),
	(90, 'Rt Elbow CT', 5400.00, 'CT'),
	(91, 'Rt Arm CT', 5400.00, 'CT'),
	(92, 'Rt Shoulder CT', 5400.00, 'CT'),
	(93, 'Rt Hip CT', 5400.00, 'CT'),
	(94, 'Rt Thigh CT', 5400.00, 'CT'),
	(95, 'Rt Knee CT', 5400.00, 'CT'),
	(96, 'Rt Leg CT', 5400.00, 'CT'),
	(97, 'Rt Ankle CT', 5400.00, 'CT'),
	(98, 'Rt Foot CT', 5400.00, 'CT'),
	(106, 'Head CT', 2400.00, 'CT'),
	(107, 'Brain Angio CT', 4200.00, 'CT'),
	(108, 'Neck CT', 4200.00, 'CT'),
	(109, 'Chest CT', 4200.00, 'CT'),
	(110, 'Chest Angio CT', 4200.00, 'CT'),
	(111, 'Abdominal CT', 4200.00, 'CT'),
	(112, 'Pelvic CT', 4200.00, 'CT'),
	(113, 'Abdominopelvic CT', 4200.00, 'CT'),
	(114, 'Triphasic Abdominal CT', 4200.00, 'CT'),
	(115, 'Lt Hand X-Ray', 1200.00, 'DX'),
	(116, 'Lt Wrist X-Ray', 1200.00, 'DX'),
	(117, 'Lt Forearm X-Ray', 1200.00, 'DX'),
	(118, 'Lt Elbow X-Ray', 1200.00, 'DX'),
	(119, 'Lt Arm X-Ray', 1200.00, 'DX'),
	(120, 'Lt Shoulder X-Ray', 1200.00, 'DX'),
	(121, 'Lt Hip X-Ray', 1200.00, 'DX'),
	(122, 'Lt Thigh X-Ray', 1200.00, 'DX'),
	(123, 'Lt Knee X-Ray', 1200.00, 'DX'),
	(124, 'Lt Leg X-Ray', 1200.00, 'DX'),
	(125, 'Lt Ankle X-Ray', 1200.00, 'DX'),
	(126, 'Lt Foot X-Ray', 1200.00, 'DX'),
	(127, 'Rt Hand X-Ray', 1200.00, 'DX'),
	(128, 'Rt Wrist X-Ray', 1200.00, 'DX'),
	(129, 'Rt Forearm X-Ray', 1200.00, 'DX'),
	(130, 'Rt Elbow X-Ray', 1200.00, 'DX'),
	(131, 'Rt Arm X-Ray', 1200.00, 'DX'),
	(132, 'Rt Shoulder X-Ray', 1200.00, 'DX'),
	(133, 'Rt Hip X-Ray', 1200.00, 'DX'),
	(134, 'Rt Thigh X-Ray', 1200.00, 'DX'),
	(135, 'Rt Knee X-Ray', 1200.00, 'DX'),
	(136, 'Rt Leg X-Ray', 1200.00, 'DX'),
	(137, 'Rt Ankle X-Ray', 1200.00, 'DX'),
	(138, 'Rt Foot X-Ray', 1200.00, 'DX'),
	(139, 'Skull X-Ray', 1200.00, 'DX'),
	(140, 'Neck X-Ray', 1200.00, 'DX'),
	(141, 'Chest X-Ray', 1200.00, 'DX'),
	(142, 'Abdominal X-Ray', 1200.00, 'DX'),
	(143, 'Pelvic X-Ray', 1200.00, 'DX'),
	(147, 'Cervical CT', 5400.00, 'CT'),
	(148, 'Cervical X-Ray', 1200.00, 'DX'),
	(149, 'Lumbar CT', 5400.00, 'CT'),
	(150, 'Lumbar X-Ray', 1200.00, 'DX'),
	(151, 'Thorasic CT', 5400.00, 'CT'),
	(152, 'Thorasic X-Ray', 1200.00, 'DX'),
	(155, 'Abdominal US', 1200.00, 'US'),
	(156, 'Abdominopelvic US', 1200.00, 'US'),
	(157, 'Neck US', 1200.00, 'US');
/*!40000 ALTER TABLE `services` ENABLE KEYS */;

-- Dumping structure for table test.users
DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `userid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `firstname` varchar(50) NOT NULL,
  `lastname` varchar(50) NOT NULL,
  `sex` varchar(50) NOT NULL,
  `mobileno` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`userid`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table test.users: ~4 rows (approximately)
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` (`userid`, `firstname`, `lastname`, `sex`, `mobileno`) VALUES
	(1, 'eman', 'shif', 'M', NULL),
	(2, 'dddd', 'fffff', 'F', NULL),
	(3, 'mmm', 'gggg', 'F', NULL),
	(4, 'kkkkk', 'lllll', 'M', NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;

-- Dumping structure for table test.visits
DROP TABLE IF EXISTS `visits`;
CREATE TABLE IF NOT EXISTS `visits` (
  `visitid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `patientid` int(10) unsigned NOT NULL,
  `scheduledatetime_start` datetime DEFAULT NULL,
  `scheduledatetime_end` datetime DEFAULT NULL,
  `fileuploads` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`fileuploads`)),
  `createdat` datetime DEFAULT current_timestamp(),
  `scanstatus` varchar(50) DEFAULT 'scan_pending',
  PRIMARY KEY (`visitid`),
  KEY `fk_pid` (`patientid`),
  CONSTRAINT `fk_pid` FOREIGN KEY (`patientid`) REFERENCES `patients` (`patientid`)
) ENGINE=InnoDB AUTO_INCREMENT=131 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table test.visits: ~96 rows (approximately)
/*!40000 ALTER TABLE `visits` DISABLE KEYS */;
INSERT INTO `visits` (`visitid`, `patientid`, `scheduledatetime_start`, `scheduledatetime_end`, `fileuploads`, `createdat`, `scanstatus`) VALUES
	(33, 56, '2025-05-31 09:00:00', '2025-05-31 09:20:00', '{"files":[{"documentUploadType":"Prescription","filePath":"/documents/787e6c72ba29b92a898857000.jpg","mimetype":"image/jpeg","uploadedAt":1748689730750},{"documentUploadType":"Attachment","filePath":"/documents/787e6c72ba29b92a898857001.pdf","mimetype":"application/pdf","uploadedAt":1748689730750}]}', '2025-05-31 14:08:50', 'scan_pending'),
	(34, 57, '2025-05-31 09:20:00', '2025-05-31 09:40:00', '{"files":[{"documentUploadType":"Prescription","filePath":"/documents/aaab94076f8fc28161f5f6800.jpg","mimetype":"image/jpeg","uploadedAt":1748707203368},{"documentUploadType":"Prescription","filePath":"/documents/aaab94076f8fc28161f5f6801.pdf","mimetype":"application/pdf","uploadedAt":1748707203368}]}', '2025-05-31 19:00:02', 'scan_pending'),
	(35, 58, NULL, NULL, '{"files":[{"documentUploadType":"Prescription","filePath":"/documents/aaab94076f8fc28161f5f6802.jpg","mimetype":"image/jpeg","uploadedAt":1748707282210}]}', '2025-05-31 19:00:36', 'scan_completed'),
	(36, 59, NULL, NULL, '{"files":[{"documentUploadType":"Prescription","filePath":"/documents/aaab94076f8fc28161f5f6803.jpg","mimetype":"image/jpeg","uploadedAt":1748707585208}]}', '2025-05-31 19:06:25', 'scan_completed'),
	(37, 60, NULL, NULL, NULL, '2025-06-05 10:13:12', 'scan_pending'),
	(38, 61, NULL, NULL, NULL, '2025-06-05 12:12:24', 'scan_pending'),
	(39, 62, NULL, NULL, NULL, '2025-06-05 12:16:38', 'scan_pending'),
	(40, 63, NULL, NULL, NULL, '2025-06-05 12:22:24', 'scan_pending'),
	(41, 64, NULL, NULL, NULL, '2025-06-05 12:23:09', 'scan_pending'),
	(42, 65, NULL, NULL, NULL, '2025-06-05 12:58:57', 'scan_pending'),
	(44, 67, NULL, NULL, NULL, '2025-06-05 13:09:15', 'scan_pending'),
	(45, 68, NULL, NULL, NULL, '2025-06-05 15:15:51', 'scan_pending'),
	(46, 69, NULL, NULL, NULL, '2025-06-05 16:32:54', 'scan_pending'),
	(47, 70, NULL, NULL, NULL, '2025-06-05 16:35:24', 'scan_pending'),
	(48, 71, NULL, NULL, NULL, '2025-06-06 10:37:08', 'scan_pending'),
	(49, 72, NULL, NULL, NULL, '2025-06-06 11:53:58', 'scan_pending'),
	(50, 73, NULL, NULL, NULL, '2025-06-06 11:56:40', 'scan_pending'),
	(51, 74, NULL, NULL, NULL, '2025-06-06 12:41:44', 'scan_pending'),
	(52, 75, NULL, NULL, NULL, '2025-06-06 12:42:00', 'scan_pending'),
	(53, 76, NULL, NULL, NULL, '2025-06-06 12:43:20', 'scan_pending'),
	(54, 77, NULL, NULL, NULL, '2025-06-06 12:48:06', 'scan_pending'),
	(55, 78, NULL, NULL, NULL, '2025-06-06 12:52:08', 'scan_pending'),
	(56, 79, NULL, NULL, NULL, '2025-06-06 12:58:16', 'scan_pending'),
	(57, 80, NULL, NULL, NULL, '2025-06-06 13:03:41', 'scan_pending'),
	(58, 81, NULL, NULL, NULL, '2025-06-06 13:11:35', 'scan_pending'),
	(59, 82, NULL, NULL, NULL, '2025-06-06 13:12:36', 'scan_pending'),
	(60, 83, '2025-06-06 13:20:11', NULL, NULL, '2025-06-06 13:20:11', 'scan_pending'),
	(61, 84, '2025-06-06 13:43:14', NULL, NULL, '2025-06-06 13:43:14', 'scan_pending'),
	(62, 85, '2025-06-06 14:01:26', NULL, NULL, '2025-06-06 14:01:26', 'scan_pending'),
	(63, 86, '2025-06-06 14:06:12', NULL, NULL, '2025-06-06 14:06:12', 'scan_pending'),
	(64, 87, '2025-06-06 14:07:27', NULL, '{"files":[{"documentUploadType":"Prescription","filePath":"/documents/aaab94076f8fc28161f5f6803.jpg","mimetype":"image/jpeg","uploadedAt":1748707585208}]}', '2025-06-06 14:07:27', 'scan_pending'),
	(65, 88, '2025-06-06 14:09:43', NULL, NULL, '2025-06-06 14:09:43', 'scan_pending'),
	(66, 89, '2025-06-06 14:10:17', NULL, NULL, '2025-06-06 14:10:17', 'scan_pending'),
	(67, 90, '2025-06-06 14:10:59', NULL, NULL, '2025-06-06 14:10:59', 'scan_pending'),
	(68, 91, '2025-06-06 14:11:34', NULL, NULL, '2025-06-06 14:11:34', 'scan_pending'),
	(69, 92, '2025-06-06 14:13:11', NULL, NULL, '2025-06-06 14:13:11', 'scan_pending'),
	(70, 93, '2025-06-06 14:14:38', NULL, NULL, '2025-06-06 14:14:38', 'scan_pending'),
	(71, 94, '2025-06-06 14:16:22', NULL, NULL, '2025-06-06 14:16:22', 'scan_pending'),
	(72, 95, '2025-06-06 14:18:22', NULL, NULL, '2025-06-06 14:18:22', 'scan_pending'),
	(73, 96, '2025-06-06 14:39:11', NULL, NULL, '2025-06-06 14:39:11', 'scan_pending'),
	(74, 97, '2025-06-06 14:40:20', NULL, NULL, '2025-06-06 14:40:21', 'scan_pending'),
	(75, 98, '2025-06-06 14:42:45', NULL, NULL, '2025-06-06 14:42:45', 'scan_pending'),
	(76, 99, '2025-06-06 14:44:36', NULL, NULL, '2025-06-06 14:44:36', 'scan_pending'),
	(77, 100, '2025-06-06 14:45:51', NULL, NULL, '2025-06-06 14:45:51', 'scan_pending'),
	(78, 101, '2025-06-06 14:47:49', NULL, NULL, '2025-06-06 14:47:49', 'scan_pending'),
	(79, 102, '2025-06-06 14:50:06', NULL, NULL, '2025-06-06 14:50:06', 'scan_pending'),
	(80, 103, '2025-06-06 14:51:15', NULL, NULL, '2025-06-06 14:51:15', 'scan_pending'),
	(81, 104, '2025-06-06 15:23:07', NULL, NULL, '2025-06-06 15:23:07', 'scan_pending'),
	(82, 105, '2025-06-06 15:26:13', NULL, NULL, '2025-06-06 15:26:13', 'scan_pending'),
	(83, 106, '2025-06-06 16:50:05', NULL, NULL, '2025-06-06 16:50:05', 'scan_pending'),
	(84, 107, '2025-06-06 16:53:02', NULL, NULL, '2025-06-06 16:53:02', 'scan_pending'),
	(85, 108, '2025-06-06 17:09:43', NULL, NULL, '2025-06-06 17:09:43', 'scan_pending'),
	(86, 109, '2025-06-06 17:23:59', NULL, NULL, '2025-06-06 17:23:59', 'scan_pending'),
	(87, 110, '2025-06-06 17:26:11', NULL, NULL, '2025-06-06 17:26:11', 'scan_pending'),
	(88, 111, '2025-06-06 17:28:00', NULL, NULL, '2025-06-06 17:28:00', 'scan_pending'),
	(89, 112, '2025-06-06 17:29:18', NULL, NULL, '2025-06-06 17:29:18', 'scan_pending'),
	(90, 113, '2025-06-06 17:30:10', NULL, NULL, '2025-06-06 17:30:10', 'scan_pending'),
	(91, 114, '2025-06-06 17:32:49', NULL, NULL, '2025-06-06 17:32:49', 'scan_pending'),
	(92, 115, '2025-06-06 17:37:59', NULL, NULL, '2025-06-06 17:37:59', 'scan_pending'),
	(93, 116, '2025-06-06 17:39:02', NULL, NULL, '2025-06-06 17:39:02', 'scan_pending'),
	(94, 117, '2025-06-06 17:49:19', NULL, NULL, '2025-06-06 17:49:19', 'scan_pending'),
	(95, 118, '2025-06-06 18:02:00', NULL, NULL, '2025-06-06 18:02:03', 'scan_pending'),
	(96, 119, '2025-06-06 18:04:59', NULL, NULL, '2025-06-06 18:04:59', 'scan_pending'),
	(97, 120, '2025-06-06 18:06:47', NULL, NULL, '2025-06-06 18:06:47', 'scan_pending'),
	(98, 121, '2025-06-06 18:08:02', NULL, NULL, '2025-06-06 18:08:02', 'scan_pending'),
	(99, 122, '2025-06-06 18:20:41', NULL, NULL, '2025-06-06 18:20:41', 'scan_pending'),
	(100, 123, '2025-06-06 18:25:58', NULL, NULL, '2025-06-06 18:25:58', 'scan_pending'),
	(101, 124, '2025-06-06 18:26:29', NULL, NULL, '2025-06-06 18:26:29', 'scan_pending'),
	(102, 125, '2025-06-06 18:35:11', NULL, NULL, '2025-06-06 18:35:11', 'scan_pending'),
	(103, 126, '2025-06-06 19:10:24', NULL, NULL, '2025-06-06 19:10:24', 'scan_pending'),
	(104, 127, '2025-06-06 19:11:08', NULL, NULL, '2025-06-06 19:11:08', 'scan_pending'),
	(105, 128, '2025-06-06 19:14:36', NULL, NULL, '2025-06-06 19:14:36', 'scan_pending'),
	(106, 129, '2025-06-06 20:05:17', NULL, NULL, '2025-06-06 20:05:17', 'scan_pending'),
	(107, 130, '2025-06-06 20:06:53', NULL, NULL, '2025-06-06 20:06:53', 'scan_pending'),
	(108, 131, '2025-06-06 20:32:58', NULL, NULL, '2025-06-06 20:32:58', 'scan_pending'),
	(109, 132, '2025-06-06 20:44:56', NULL, NULL, '2025-06-06 20:44:56', 'scan_pending'),
	(110, 133, '2025-06-06 20:48:22', NULL, NULL, '2025-06-06 20:48:22', 'scan_pending'),
	(111, 134, '2025-06-06 20:50:13', NULL, NULL, '2025-06-06 20:50:14', 'scan_pending'),
	(112, 135, '2025-06-06 20:53:42', NULL, NULL, '2025-06-06 20:53:42', 'scan_pending'),
	(113, 136, '2025-06-06 21:00:34', NULL, NULL, '2025-06-06 21:00:35', 'scan_pending'),
	(114, 137, '2025-06-06 21:02:54', NULL, NULL, '2025-06-06 21:02:59', 'scan_pending'),
	(115, 138, '2025-06-06 21:09:39', NULL, NULL, '2025-06-06 21:09:42', 'scan_pending'),
	(116, 139, '2025-06-06 21:12:37', NULL, NULL, '2025-06-06 21:12:39', 'scan_pending'),
	(117, 140, '2025-06-06 22:15:33', NULL, NULL, '2025-06-06 22:15:33', 'scan_pending'),
	(118, 141, '2025-06-08 14:56:04', NULL, NULL, '2025-06-08 14:56:04', 'scan_pending'),
	(119, 142, '2025-06-08 14:59:16', NULL, NULL, '2025-06-08 14:59:16', 'scan_pending'),
	(120, 143, '2025-06-08 15:33:13', NULL, NULL, '2025-06-08 15:33:13', 'scan_pending'),
	(121, 144, '2025-06-08 15:39:59', NULL, NULL, '2025-06-08 15:39:59', 'scan_pending'),
	(122, 145, '2025-06-08 15:41:34', NULL, NULL, '2025-06-08 15:41:34', 'scan_pending'),
	(123, 146, '2025-06-08 15:45:18', NULL, NULL, '2025-06-08 15:45:18', 'scan_pending'),
	(124, 147, '2025-06-08 15:51:22', NULL, NULL, '2025-06-08 15:51:22', 'scan_pending'),
	(125, 148, '2025-06-08 15:53:49', NULL, NULL, '2025-06-08 15:53:49', 'scan_pending'),
	(127, 150, '2025-06-16 18:07:23', NULL, NULL, '2025-06-16 18:07:23', 'scan_cancelled'),
	(128, 151, '2025-06-17 18:58:01', '1970-01-01 03:00:00', NULL, '2025-06-17 18:58:03', 'scan_cancelled'),
	(129, 152, '2025-06-20 17:00:34', NULL, NULL, '2025-06-20 17:00:35', 'scan_pending'),
	(130, 153, '2025-06-20 17:47:59', NULL, NULL, '2025-06-20 17:47:59', 'scan_pending');
/*!40000 ALTER TABLE `visits` ENABLE KEYS */;

-- Dumping structure for table test.visit_service_line
DROP TABLE IF EXISTS `visit_service_line`;
CREATE TABLE IF NOT EXISTS `visit_service_line` (
  `visitserviceid` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `visitid` int(10) unsigned NOT NULL,
  `serviceid` int(10) unsigned NOT NULL,
  `reportstatus` varchar(50) DEFAULT 'report_pending',
  `assignedto` int(10) unsigned DEFAULT NULL,
  `reportdelta` mediumtext DEFAULT NULL,
  `wlsend` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`visitserviceid`) USING BTREE,
  KEY `fk_serviceid` (`serviceid`),
  KEY `fk_vid` (`visitid`),
  KEY `composite_visid_serid` (`visitid`,`serviceid`),
  CONSTRAINT `fk_serviceid` FOREIGN KEY (`serviceid`) REFERENCES `services` (`serviceid`),
  CONSTRAINT `fk_vid` FOREIGN KEY (`visitid`) REFERENCES `visits` (`visitid`)
) ENGINE=InnoDB AUTO_INCREMENT=137 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dumping data for table test.visit_service_line: ~105 rows (approximately)
/*!40000 ALTER TABLE `visit_service_line` DISABLE KEYS */;
INSERT INTO `visit_service_line` (`visitserviceid`, `visitid`, `serviceid`, `reportstatus`, `assignedto`, `reportdelta`, `wlsend`) VALUES
	(27, 33, 66, 'report_drafted', NULL, '{"ops":[{"insert":"asfewfs\\n"}]}', 0),
	(28, 34, 34, 'report_pending', NULL, NULL, 0),
	(29, 35, 106, 'report_pending', NULL, NULL, 0),
	(30, 36, 155, 'report_verified', NULL, '{"ops":[{"insert":"dsjfkwjfeoieafn\\nfwejflalfkndskf\\n"}]}', 0),
	(31, 35, 38, 'report_pending', NULL, NULL, 0),
	(32, 37, 80, 'report_pending', NULL, NULL, 0),
	(33, 38, 113, 'report_pending', NULL, NULL, 0),
	(34, 39, 113, 'report_pending', NULL, NULL, 0),
	(35, 40, 113, 'report_pending', NULL, NULL, 0),
	(36, 41, 113, 'report_pending', NULL, NULL, 0),
	(37, 42, 82, 'report_pending', NULL, NULL, 0),
	(39, 44, 147, 'report_pending', NULL, NULL, 0),
	(40, 45, 147, 'report_pending', NULL, NULL, 0),
	(41, 46, 95, 'report_pending', NULL, NULL, 0),
	(42, 47, 149, 'report_pending', NULL, NULL, 0),
	(43, 48, 147, 'report_pending', NULL, NULL, 0),
	(44, 49, 147, 'report_pending', NULL, NULL, 0),
	(45, 50, 147, 'report_pending', NULL, NULL, 0),
	(46, 51, 151, 'report_pending', NULL, NULL, 0),
	(47, 52, 151, 'report_pending', NULL, NULL, 0),
	(48, 53, 151, 'report_pending', NULL, NULL, 0),
	(49, 54, 151, 'report_pending', NULL, NULL, 0),
	(50, 55, 151, 'report_pending', NULL, NULL, 0),
	(51, 56, 151, 'report_pending', NULL, NULL, 0),
	(52, 57, 151, 'report_pending', NULL, NULL, 0),
	(53, 58, 151, 'report_pending', NULL, NULL, 0),
	(54, 59, 151, 'report_pending', NULL, NULL, 0),
	(55, 60, 151, 'report_pending', NULL, NULL, 0),
	(56, 61, 114, 'report_pending', NULL, NULL, 0),
	(57, 62, 111, 'report_pending', NULL, NULL, 0),
	(58, 63, 111, 'report_pending', NULL, NULL, 0),
	(59, 64, 111, 'report_drafted', NULL, '{"ops":[{"insert":"flsakdflkdsflk afkldjfaweofj lakdf k sdf\\n"}]}', 0),
	(60, 65, 80, 'report_pending', NULL, NULL, 0),
	(61, 66, 80, 'report_pending', NULL, NULL, 0),
	(62, 67, 80, 'report_pending', NULL, NULL, 0),
	(63, 68, 80, 'report_pending', NULL, NULL, 0),
	(64, 69, 80, 'report_pending', NULL, NULL, 0),
	(65, 70, 80, 'report_pending', NULL, NULL, 0),
	(66, 71, 80, 'report_pending', NULL, NULL, 0),
	(67, 72, 80, 'report_pending', NULL, NULL, 0),
	(68, 73, 80, 'report_pending', NULL, NULL, 0),
	(69, 74, 80, 'report_pending', NULL, NULL, 0),
	(70, 75, 80, 'report_pending', NULL, NULL, 0),
	(71, 76, 80, 'report_pending', NULL, NULL, 0),
	(72, 77, 80, 'report_pending', NULL, NULL, 0),
	(73, 78, 80, 'report_pending', NULL, NULL, 0),
	(74, 79, 80, 'report_pending', NULL, NULL, 0),
	(75, 80, 80, 'report_pending', NULL, NULL, 0),
	(76, 81, 80, 'report_pending', NULL, NULL, 0),
	(77, 82, 80, 'report_pending', NULL, NULL, 0),
	(78, 83, 80, 'report_pending', NULL, NULL, 0),
	(79, 84, 80, 'report_pending', NULL, NULL, 0),
	(80, 85, 80, 'report_pending', NULL, NULL, 0),
	(81, 86, 80, 'report_pending', NULL, NULL, 0),
	(82, 87, 80, 'report_pending', NULL, NULL, 0),
	(83, 88, 80, 'report_pending', NULL, NULL, 0),
	(84, 89, 80, 'report_pending', NULL, NULL, 0),
	(85, 90, 80, 'report_pending', NULL, NULL, 0),
	(86, 91, 80, 'report_pending', NULL, NULL, 0),
	(87, 92, 80, 'report_pending', NULL, NULL, 0),
	(88, 93, 80, 'report_pending', NULL, NULL, 0),
	(89, 94, 80, 'report_pending', NULL, NULL, 0),
	(90, 95, 80, 'report_pending', NULL, NULL, 0),
	(91, 96, 80, 'report_pending', NULL, NULL, 0),
	(92, 97, 80, 'report_pending', NULL, NULL, 0),
	(93, 98, 80, 'report_pending', NULL, NULL, 0),
	(94, 99, 80, 'report_pending', NULL, NULL, 0),
	(95, 100, 80, 'report_pending', NULL, NULL, 0),
	(96, 101, 80, 'report_pending', NULL, NULL, 0),
	(97, 102, 80, 'report_pending', NULL, NULL, 0),
	(98, 103, 80, 'report_pending', NULL, NULL, 0),
	(99, 104, 80, 'report_pending', NULL, NULL, 0),
	(100, 105, 80, 'report_pending', NULL, NULL, 0),
	(101, 106, 80, 'report_pending', NULL, NULL, 0),
	(102, 107, 80, 'report_pending', NULL, NULL, 0),
	(103, 108, 80, 'report_pending', NULL, NULL, 0),
	(104, 109, 80, 'report_pending', NULL, NULL, 0),
	(105, 110, 80, 'report_pending', NULL, NULL, 0),
	(106, 111, 80, 'report_pending', NULL, NULL, 0),
	(107, 112, 80, 'report_pending', NULL, NULL, 0),
	(108, 113, 80, 'report_pending', NULL, NULL, 0),
	(109, 114, 80, 'report_pending', NULL, NULL, 0),
	(110, 115, 80, 'report_pending', NULL, NULL, 0),
	(111, 116, 80, 'report_pending', NULL, NULL, 0),
	(112, 117, 80, 'report_pending', NULL, NULL, 0),
	(113, 118, 147, 'report_pending', NULL, NULL, 0),
	(114, 119, 147, 'report_pending', NULL, NULL, 0),
	(115, 120, 81, 'report_pending', NULL, NULL, 0),
	(116, 121, 82, 'report_pending', NULL, NULL, 0),
	(117, 122, 82, 'report_pending', NULL, NULL, 0),
	(118, 123, 82, 'report_pending', NULL, NULL, 0),
	(119, 124, 82, 'report_pending', NULL, NULL, 0),
	(120, 125, 82, 'report_pending', NULL, NULL, 1),
	(121, 127, 82, 'report_pending', NULL, NULL, 1),
	(122, 128, 147, 'report_pending', NULL, NULL, 1),
	(123, 128, 79, 'report_pending', NULL, NULL, 1),
	(126, 128, 79, 'report_pending', NULL, NULL, 0),
	(127, 128, 147, 'report_pending', NULL, NULL, 0),
	(128, 128, 79, 'report_pending', NULL, NULL, 0),
	(129, 128, 147, 'report_pending', NULL, NULL, 0),
	(130, 129, 112, 'report_pending', NULL, NULL, 1),
	(132, 130, 110, 'report_pending', NULL, NULL, 1),
	(133, 130, 81, 'report_pending', NULL, NULL, 1),
	(134, 130, 83, 'report_pending', NULL, NULL, 1),
	(136, 129, 82, 'report_pending', NULL, NULL, 1);
/*!40000 ALTER TABLE `visit_service_line` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
