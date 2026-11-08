/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} fullName
 * @property {string} email
 * @property {string} phone
 * @property {('WORKER'|'PROVIDER'|'ADMIN')} role
 * @property {boolean} isVerified
 * @property {string} [createdAt]
 */

/**
 * @typedef {Object} ProviderProfile
 * @property {string} id
 * @property {string} userId
 * @property {string} userName
 * @property {string} userEmail
 * @property {string} userPhone
 * @property {('INDIVIDUAL'|'BUSINESS')} providerType
 * @property {string} [businessName]
 * @property {number} [avgRating]
 */

/**
 * @typedef {Object} WorkerProfile
 * @property {string} id
 * @property {string} userId
 * @property {string} userName
 * @property {string} userEmail
 * @property {string} userPhone
 * @property {string} [bio]
 * @property {number} [experienceYears]
 * @property {('PENDING'|'VERIFIED'|'REJECTED')} verificationStatus
 * @property {number} [avgRating]
 * @property {number} [serviceRadiusKm]
 */

/**
 * @typedef {Object} Category
 * @property {string} id
 * @property {string} name
 * @property {string} [icon]
 * @property {boolean} isActive
 */

/**
 * @typedef {Object} Address
 * @property {string} id
 * @property {string} userId
 * @property {string} line1
 * @property {string} city
 * @property {string} pincode
 * @property {number} [latitude]
 * @property {number} [longitude]
 */

/**
 * @typedef {Object} Gig
 * @property {string} id
 * @property {string} providerProfileId
 * @property {string} [providerName]
 * @property {string} categoryId
 * @property {string} [categoryName]
 * @property {string} addressId
 * @property {string} [addressSummary]
 * @property {string} title
 * @property {string} description
 * @property {number} budget
 * @property {string} scheduledAt
 * @property {('OPEN'|'ASSIGNED'|'IN_PROGRESS'|'COMPLETED'|'CANCELLED')} status
 * @property {number} [applicationCount]
 */

/**
 * @typedef {Object} Application
 * @property {string} id
 * @property {string} gigId
 * @property {string} [gigTitle]
 * @property {string} workerProfileId
 * @property {string} [workerName]
 * @property {number} [workerRating]
 * @property {number} quotedPrice
 * @property {string} [coverNote]
 * @property {('PENDING'|'ACCEPTED'|'REJECTED'|'WITHDRAWN')} status
 * @property {string} [createdAt]
 */

/**
 * @typedef {Object} Booking
 * @property {string} id
 * @property {string} gigId
 * @property {string} [gigTitle]
 * @property {string} applicationId
 * @property {string} workerProfileId
 * @property {string} [workerName]
 * @property {string} providerProfileId
 * @property {string} [providerName]
 * @property {number} agreedPrice
 * @property {string} [startedAt]
 * @property {string} [completedAt]
 * @property {('SCHEDULED'|'IN_PROGRESS'|'COMPLETED'|'CANCELLED')} status
 */

/**
 * @typedef {Object} Payment
 * @property {string} id
 * @property {string} bookingId
 * @property {number} amount
 * @property {number} platformFee
 * @property {number} netWorkerAmount
 * @property {('CARD'|'UPI'|'BANK_TRANSFER'|'CASH'|'WALLET')} method
 * @property {('PENDING'|'PAID'|'FAILED'|'REFUNDED')} status
 * @property {string} [paidAt]
 */

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} bookingId
 * @property {string} reviewerId
 * @property {string} [reviewerName]
 * @property {string} revieweeId
 * @property {string} [revieweeName]
 * @property {number} rating
 * @property {string} [comment]
 * @property {string} [createdAt]
 */

/**
 * @typedef {Object} Message
 * @property {string} id
 * @property {string} gigId
 * @property {string} senderId
 * @property {string} [senderName]
 * @property {string} receiverId
 * @property {string} [receiverName]
 * @property {string} text
 * @property {string} sentAt
 */

export {};

