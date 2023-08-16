import type { Sequelize } from 'sequelize'
import * as user from './user'
import * as event from './event'
import * as organizer from './organizer'
import * as speaker from './speaker'
import * as venue from './venue'
import * as category from './category'
import * as eventSpeaker from './eventSpeaker'
import * as eventVenue from './eventVenue'
import * as organizerRequestLog from './requestLog'
import * as organizerLog from './organizerLog'
import * as eventLog from './eventLog'
import * as organizerRequest from './request'
import * as region from './region'
import * as country from './country'
import * as resource from './resource'
import * as schedule from './schedule'
import * as suspension from './suspension'
import * as mailing from './mailing'
import { EventPicture, init as initEventPicture } from './eventPicture'
import { VenuePicture, init as initVenuePicture } from './venuePicture'

const init = (sequelize: Sequelize) => {
	// relationships
	country.init(sequelize)
	category.init(sequelize)
	region.init(sequelize)
	schedule.init(sequelize)
	speaker.init(sequelize)
	organizer.init(sequelize)
	user.init(sequelize)
	event.init(sequelize)
	eventSpeaker.init(sequelize)
	initEventPicture(sequelize)
	initVenuePicture(sequelize)
	organizerRequestLog.init(sequelize)
	eventLog.init(sequelize)
	organizerLog.init(sequelize)
	organizerRequest.init(sequelize)
	resource.init(sequelize)
	venue.init(sequelize)
	suspension.init(sequelize)
	mailing.init(sequelize)
	eventVenue.init(sequelize)

	// associations
	event.Event.belongsTo(user.User, { foreignKey: 'userId', as: 'user' })
	user.User.hasMany(event.Event, { foreignKey: 'userId', as: 'events' })

	event.Event.belongsTo(schedule.Schedule, { foreignKey: 'scheduleId', as: 'schedule' })
	schedule.Schedule.hasMany(event.Event, { foreignKey: 'scheduleId', as: 'event' })

	mailing.Mailing.belongsTo(event.Event, { foreignKey: 'eventId' })
	event.Event.hasMany(mailing.Mailing, { foreignKey: 'eventId' })

	// Event->Pictures assocications
	event.Event.belongsTo(resource.Resource, { foreignKey: 'bannerId', as: 'banner' })
	event.Event.belongsTo(resource.Resource, { foreignKey: 'bannerMobileId', as: 'bannerMobile' })

	event.Event.belongsToMany(resource.Resource, {
		through: {
			model: EventPicture,
			unique: false
		},
		as: 'pictures',
		foreignKey: 'eventId'
	})
	resource.Resource.belongsToMany(event.Event, {
		through: {
			model: EventPicture,
			unique: false
		},
		as: 'picturesEvents',
		foreignKey: 'resourceId'
	})

	//Venue->Pictures Associations
	venue.Venue.belongsToMany(resource.Resource, {
		through: {
			model: VenuePicture,
			unique: false
		},
		as: 'pictures',
		foreignKey: 'venueId'
	})
	resource.Resource.belongsToMany(venue.Venue, {
		through: {
			model: VenuePicture,
			unique: false
		},
		foreignKey: 'resourceId'
	})

	//Organizer->Resource associations (logo)
	organizer.Organizer.belongsTo(resource.Resource, { foreignKey: 'logoId', as: 'logo' })

	//Speaker->Resource Association (picture)
	speaker.Speaker.belongsTo(resource.Resource, { foreignKey: 'pictureId', as: 'picture' })

	//SpeakerEvent(snapshot)->Resource (picture)
	eventSpeaker.EventSpeaker.belongsTo(resource.Resource, {
		foreignKey: 'pictureId',
		as: 'picture'
	})

	//Resource->User association
	resource.Resource.belongsTo(user.User, { foreignKey: 'userId', as: 'user' })

	event.Event.belongsTo(region.Region, { foreignKey: 'regionId', as: 'region' })
	region.Region.hasMany(event.Event, { foreignKey: 'regionId', as: 'events' })

	venue.Venue.belongsTo(region.Region, { foreignKey: 'regionId', as: 'region' })
	region.Region.hasMany(venue.Venue, { foreignKey: 'regionId', as: 'venues' })

	organizerRequestLog.OrganizerRequestLog.belongsTo(organizerRequest.OrganizerRequest, {
		foreignKey: 'organizerRequestId',
		as: 'organizerRequest'
	})
	organizerRequestLog.OrganizerRequestLog.belongsTo(user.User, {
		foreignKey: 'userId',
		as: 'user'
	})

	eventLog.EventLog.belongsTo(event.Event, { foreignKey: 'eventId', as: 'event' })
	eventLog.EventLog.belongsTo(user.User, { foreignKey: 'userId', as: 'user' })

	organizerLog.OrganizerLog.belongsTo(organizer.Organizer, {
		foreignKey: 'organizerId',
		as: 'organizer'
	})
	organizerLog.OrganizerLog.belongsTo(user.User, { foreignKey: 'userId', as: 'user' })

	event.Event.belongsTo(organizer.Organizer, { foreignKey: 'organizerId', as: 'organizer' })
	organizer.Organizer.hasMany(event.Event, { foreignKey: 'organizerId', as: 'events' })

	category.Category.belongsToMany(event.Event, {
		through: 'EventCategory',
		foreignKey: 'categoryID',
		otherKey: 'eventId',
		timestamps: false,
		as: 'events'
	})
	event.Event.belongsToMany(category.Category, {
		through: 'EventCategory',
		foreignKey: 'eventId',
		otherKey: 'categoryId',
		timestamps: false,
		as: 'categories'
	})

	organizer.Organizer.belongsToMany(region.Region, {
		through: 'OrganizerRegion',
		foreignKey: 'organizerId',
		otherKey: 'regionId',
		timestamps: false,
		as: 'regions'
	})
	region.Region.belongsToMany(organizer.Organizer, {
		through: 'OrganizerRegion',
		foreignKey: 'regionId',
		otherKey: 'organizerId',
		timestamps: false,
		as: 'organizers'
	})

	organizerRequest.OrganizerRequest.belongsTo(resource.Resource, {
		foreignKey: 'logoId',
		as: 'logo'
	})
	organizerRequest.OrganizerRequest.belongsToMany(region.Region, {
		through: 'OrganizerRequestRegion',
		foreignKey: 'organizerRequestId',
		otherKey: 'regionId',
		timestamps: false,
		as: 'regions'
	})
	region.Region.belongsToMany(organizerRequest.OrganizerRequest, {
		through: 'OrganizerRequestRegion',
		foreignKey: 'regionId',
		otherKey: 'organizerRequestId',
		timestamps: false,
		as: 'organizerRequests'
	})

	organizerRequest.OrganizerRequest.belongsTo(country.Country, {
		foreignKey: 'countryId',
		as: 'country'
	})
	country.Country.hasMany(organizerRequest.OrganizerRequest, {
		foreignKey: 'countryId',
		as: 'organizerRequests'
	})

	organizer.Organizer.belongsTo(country.Country, { foreignKey: 'countryId', as: 'country' })
	country.Country.hasMany(organizer.Organizer, { foreignKey: 'countryId', as: 'organizers' })

	event.Event.belongsTo(country.Country, { foreignKey: 'countryId', as: 'country' })
	country.Country.hasMany(event.Event, { foreignKey: 'countryId', as: 'events' })

	speaker.Speaker.belongsTo(country.Country, { foreignKey: 'countryId', as: 'country' })
	country.Country.hasMany(speaker.Speaker, { foreignKey: 'countryId', as: 'speakers' })

	venue.Venue.belongsTo(country.Country, { foreignKey: 'countryId', as: 'country' })
	country.Country.hasMany(venue.Venue, { foreignKey: 'countryId', as: 'venues' })

	// event.Event.belongsTo(venue.Venue, { foreignKey: 'venueId', as: 'venue' })
	// venue.Venue.hasMany(event.Event, { foreignKey: 'venueId', as: 'events' })
	// Make this many to many
	event.Event.belongsTo(eventVenue.EventVenue, { foreignKey: 'eventVenueId', as: 'venue' })
	eventVenue.EventVenue.belongsTo(event.Event, { foreignKey: 'eventId', as: 'event' })
	eventVenue.EventVenue.belongsTo(venue.Venue, { foreignKey: 'venueId', as: 'venue' })
	eventVenue.EventVenue.belongsTo(country.Country, { foreignKey: 'countryId', as: 'country' })
	eventVenue.EventVenue.belongsTo(region.Region, { foreignKey: 'regionId', as: 'region' })
	eventVenue.EventVenue.belongsToMany(resource.Resource, {
		through: 'EventVenuePicture',
		as: 'pictures',
		foreignKey: 'venueId'
	})
	resource.Resource.belongsToMany(eventVenue.EventVenue, {
		through: 'EventVenuePicture',
		as: 'eventVenue',
		foreignKey: 'resourceId'
	})

	event.Event.hasMany(eventSpeaker.EventSpeaker, { foreignKey: 'eventId', as: 'eventSpeakers' })
	eventSpeaker.EventSpeaker.belongsTo(event.Event, { foreignKey: 'eventId', as: 'event' })
	eventSpeaker.EventSpeaker.belongsTo(speaker.Speaker, { foreignKey: 'speakerId', as: 'speaker' })
	eventSpeaker.EventSpeaker.belongsTo(country.Country, { foreignKey: 'countryId', as: 'country' })
}

export { init }
