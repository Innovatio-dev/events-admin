import { getConnection } from '$lib/server/config/database'
import { json } from '@sveltejs/kit'
import type { Model, Sequelize } from 'sequelize'
import { faker } from '@faker-js/faker'
import { Venue } from '$lib/server/models/venue'
import { Speaker } from '$lib/server/models/speaker'
import { Organizer } from '$lib/server/models/organizer'
import { Event } from '$lib/server/models/event'
import { User } from '$lib/server/models/user'
import { Region } from '$lib/server/models/region'
import { Country } from '$lib/server/models/country'
import { countries } from '$lib/server/constants/countries'
import { EventSpeaker } from '$lib/server/models/eventSpeaker'
import { Resource } from '$lib/server/models/resource'
import { Schedule } from '$lib/server/models/schedule'

export async function GET() {
	let countries: any[] = []
	try {
		const connection = (await getConnection()) as Sequelize
		await connection.authenticate()
		await connection.sync({ force: true })

		countries = await populate()
	} catch (error) {
		console.log(error)
		throw new Error('Unable to connect to database')
	}

	return json({ message: 'hello world', countries })
}

async function generateImageResources(
	length: number,
	urlGenerator: () => string,
	owner: User
): Promise<Resource[]> {
	const imagesResources: Resource[] = []
	for (let i = 0; i < length; i++) {
		const url = urlGenerator()
		const resource = await Resource.create({
			name: url,
			url: url,
			refCount: 0,
			userId: owner.id
		})
		imagesResources.push(resource)
	}
	return imagesResources
}

async function getRandomResourceReferences(
	resources: Resource[],
	count: number
): Promise<Resource[]> {
	const results: Resource[] = []
	for (let i = 0; i < count; i++) {
		const resource = resources[Math.floor(Math.random() * resources.length)]
		results.push(resource)
	}
	return results
}

function getRandomSpeakers(speakers: Speaker[], count: number) {
	const results: Speaker[] = []
	for (let i = 0; i < count; i++) {
		const speaker = speakers[Math.floor(Math.random() * speakers.length)]
		if (!results.find((item) => speaker.id == item.id)) {
			results.push(speaker)
		}
	}
	return results
}

function getRandomUniqueModels(models: Model[], count: number) {
	const results: Model[] = []
	for (let i = 0; i < count; i++) {
		const model = models[Math.floor(Math.random() * models.length)]
		if (!results.find((item) => model.get('id') == item.get('id'))) {
			results.push(model)
		}
	}
	return results
}

async function createSpeakerSnapshot(speaker: Speaker) {
	//increase refCount of image
	const image = await speaker.getPicture()
	const country = await speaker.getCountry()
	const speakerSnapshot = await EventSpeaker.create({
		status: speaker.status,
		name: speaker.name,
		jobRole: speaker.jobRole,
		company: speaker.company,
		instagram: speaker.instagram,
		linkedin: speaker.linkedin,
		facebook: speaker.facebook,
		youtube: speaker.youtube,
		description: speaker.description,
		speakerId: speaker.id,
		primary: Math.floor(Math.random() * 5) > 3,
		order: Math.floor(Math.random() * 5)
	})
	speakerSnapshot.setPicture(image)
	speakerSnapshot.setCountry(country)
	await speakerSnapshot.save()
	return speakerSnapshot
}

async function populate(): Promise<any[]> {
	const user = await User.create({
		cognitoId: 'e7b9e67d-413f-4ae5-aba7-3fe1ec559e58',
		name: 'Juan Hebert',
		surname: 'Chable Covarrubias',
		email: 'xmbeat@gmail.com',
		role: 1
	})

	await User.create({
		cognitoId: '56a10f46-6227-4b19-8257-0795f7b247ab',
		name: 'Edgar',
		surname: 'Mancillas',
		email: 'eman@skupee.online',
		role: 1
	})

	await User.create({
		cognitoId: '0de66d93-50e5-4483-8d6d-a4be5c5ded3a',
		name: 'Ivan',
		surname: 'Tovar',
		email: 'ivan@skupee.online',
		role: 1
	})

	const eventMimes = [
		'webp',
		'jpeg',
		'jpeg',
		'jpeg',
		'jpeg',
		'png',
		'jpeg',
		'jpeg',
		'png',
		'jpeg',
		'jpeg',
		'webp',
		'jpeg',
		'jpeg',
		'jpeg',
		'jpeg',
		'jpeg',
		'jpeg'
	]
	const eventResources: Resource[] = []

	for (let index = 0; index < eventMimes.length; index++) {
		eventResources.push(
			await Resource.create({
				originaleName: 'event' + index,
				refCount: 1,
				name: 'event' + index,
				url: `https://dashboard-events.s3.eu-central-1.amazonaws.com/public/event${index}.${eventMimes[index]}`
			})
		)
	}

	const venueMimes = ['jpeg', 'jpeg', 'jpeg', 'jpeg', 'jpeg', 'jpeg', 'jpeg', 'jpeg', 'jpeg']
	const venueResources: Resource[] = []

	for (let index = 0; index < venueMimes.length; index++) {
		venueResources.push(
			await Resource.create({
				originaleName: 'venue' + index,
				refCount: 1,
				name: 'venue' + index,
				url: `https://dashboard-events.s3.eu-central-1.amazonaws.com/public/venue${index}.${venueMimes[index]}`
			})
		)
	}

	const continents = [
		'Asia',
		'Africa',
		'North America',
		'Europe',
		'Oceania',
		'South America',
		'Antartica',
		'Virtual'
	]

	const allCountries: Country[] = []
	for (const country of countries) {
		allCountries.push(await Country.create(country))
	}
	const regions: Region[] = []
	//Creating regions
	for (const item of continents) {
		const region = await Region.create({
			name: item
		})
		regions.push(region)
	}

	const venues: Venue[] = []
	const venuesData = [
		{
			name: 'Great Strahov Stadium',
			address: 'Vaníčkova 100/6, 169 00 Praha 6-Strahov, Chequia',
			city: 'Chequia',
			email: 'test@email.com',
			description: 'test description',
			regionId: 4,
			countryId: 57,
			bannerId: null,
			location: {
				lat: 50.0804993,
				lng: 14.387747
			}
		},
		{
			name: 'AT&T Stadium',
			address: '1 AT&T Way, Arlington, TX 76011',
			city: 'Arlington',
			email: 'test@email.com',
			description: 'test description',
			regionId: 3,
			countryId: 226,
			bannerId: null,
			location: {
				lat: 32.7479966,
				lng: -97.0934165
			}
		},
		{
			name: 'Beijing National Stadium',
			address: '1 Guojiatiyuchang S Rd, Chaoyang, China, 100101',
			city: 'Pekin',
			email: 'test@email.com',
			description: 'test description',
			regionId: 1,
			countryId: 44,
			bannerId: null,
			location: {
				lat: 39.9929431,
				lng: 116.3965112
			}
		},
		{
			name: 'Wembley Stadium',
			address: 'London HA9 0WS, Reino Unido',
			city: 'London',
			email: 'test@email.com',
			description: 'test description',
			regionId: 4,
			countryId: 225,
			bannerId: null,
			location: {
				lat: 51.5560247,
				lng: -0.2796177
			}
		},
		{
			name: 'Bukit Jalil National Stadium',
			address:
				'Jalan Barat, Bukit Jalil, 57000 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur, Malasia',
			city: 'Malasia',
			email: 'test@email.com',
			description: 'test description',
			regionId: 1,
			countryId: 129,
			bannerId: null,
			location: {
				lat: 3.0546242,
				lng: 101.6912756
			}
		},
		{
			name: 'Zoom Event',
			address: 'Online',
			city: 'Zoom',
			email: 'test@email.com',
			description: 'test description',
			regionId: 8,
			countryId: 226,
			bannerId: null,
			location: {
				lat: 50.0804993,
				lng: 14.387747
			}
		}
	]

	// const businessImages = await generateImageResources(15, faker.image.business, user)
	const avatarImages = await generateImageResources(10, faker.image.avatar, user)
	//Creating Venues
	for (let i = 0; i < venuesData.length; i++) {
		// const bannerImages = await getRandomResourceReferences(businessImages, 3)
		const venue = await Venue.create(venuesData[i])
		venue.setPictures([venueResources[i]])
		await venue.save()
		venues.push(venue)
	}

	const speakers: Speaker[] = []
	//Creating Speakers
	for (let i = 0; i < 25; i++) {
		const images = await getRandomResourceReferences(avatarImages, 1)
		const speaker = await Speaker.create({
			name: faker.name.fullName(),
			jobRole: faker.name.jobTitle(),
			company: faker.company.name(),
			countryId: allCountries[Math.floor(Math.random() * allCountries.length)].id,
			city: faker.address.city(),
			email: faker.internet.email(),
			description: faker.lorem.lines(1),
			pictureId: images[0].id,
			twitter: faker.internet.userName(),
			instagram: faker.internet.userName(),
			youtube: faker.internet.userName(),
			linkedin: faker.internet.userName(),
			facebook: faker.internet.userName()
		})
		speakers.push(speaker)
	}

	const organizers: Organizer[] = []
	//Creating organizers
	for (let i = 0; i < 10; i++) {
		const images = await getRandomResourceReferences(avatarImages, 1)
		const choosedRegions = getRandomUniqueModels(regions, 3)
		const organizer = await Organizer.create({
			name: faker.name.fullName(),
			company: faker.company.name(),
			countryId: allCountries[Math.floor(Math.random() * allCountries.length)].id,
			city: faker.address.city(),
			email: faker.internet.email(),
			logoId: images[0].id,
			description: faker.lorem.lines(2),
			twitter: faker.internet.userName(),
			instagram: faker.internet.userName(),
			youtube: faker.internet.userName(),
			linkedin: faker.internet.userName(),
			facebook: faker.internet.userName()
		})
		organizer.setRegions(choosedRegions)
		await organizer.save()
		organizers.push(organizer)
	}

	const languages = [
		{
			id: 225,
			iso: 'GB',
			isoLang: 'EN',
			nicename: 'United Kingdom',
			iso3: 'GBR',
			numcode: 826,
			phonecode: 44
		},
		{
			id: 199,
			iso: 'ES',
			isoLang: 'ES',
			name: 'Spanish',
			nicename: 'Spain',
			iso3: 'ESP',
			numcode: 724,
			phonecode: 34
		},
		{
			id: 105,
			iso: 'IT',
			isoLang: 'IT',
			name: 'Italian',
			nicename: 'Italy',
			iso3: 'ITA',
			numcode: 380,
			phonecode: 39
		},
		{
			id: 107,
			iso: 'JP',
			isoLang: 'JP',
			name: 'Japanese',
			nicename: 'Japan',
			iso3: 'JPN',
			numcode: 392,
			phonecode: 81
		},
		{
			id: 73,
			iso: 'FR',
			isoLang: 'FR',
			name: 'French',
			nicename: 'France',
			iso3: 'FRA',
			numcode: 250,
			phonecode: 33
		},
		{
			id: 172,
			iso: 'PT',
			isoLang: 'PT',
			name: 'Portuguese',
			nicename: 'Portugal',
			iso3: 'PRT',
			numcode: 620,
			phonecode: 351
		},
		{
			id: 44,
			iso: 'CN',
			isoLang: 'CN',
			name: 'Chinese',
			nicename: 'China',
			iso3: 'CHN',
			numcode: 156,
			phonecode: 86
		}
	]

	//Creating events
	for (let i = 0; i < 40; i++) {
		const tempDate = faker.date.future(1)
		const startDate = new Date(tempDate)
		const endDate = tempDate.setDate(tempDate.getDate() + (Math.floor(Math.random() * 4) + 1))
		const title = faker.company.catchPhrase()
		// const images = await getRandomResourceReferences(businessImages, 2)
		const images = eventResources[Math.floor(Math.random() * eventResources.length)]
		const snapshotSpeakers = await Promise.all(
			getRandomSpeakers(speakers, 5).map((speaker) => createSpeakerSnapshot(speaker))
		)
		const organizer = getRandomUniqueModels(organizers, 1)[0]
		const venue = await Venue.findByPk(venues[Math.floor(Math.random() * venues.length)].id, {
			include: {
				model: Region,
				as: 'region'
			}
		})

		const language = languages[Math.floor(Math.random() * languages.length)]
		const translations: any[] = []

		for (let index = 0; index < 3; index++) {
			const lang = languages[Math.floor(Math.random() * languages.length)]
			if (lang.id != language.id) {
				translations.push(lang)
			}
		}

		const eventBody = {
			title: title,
			slug: slugify(title),
			bannerId: images.id,
			bannerMobileId: images.id,
			isFeatured: i < 5,
			date: startDate,
			startTime: startDate,
			endTime: endDate,
			company: faker.company.name(),
			email: faker.internet.email(),
			description: faker.lorem.lines(2),
			timeZone: faker.address.timeZone(),
			mailing: 8,
			organizerId: organizers[Math.floor(Math.random() * organizers.length)].id,
			venueId: venue?.id,
			userId: user.id,
			regionId: venue?.region.id,
			twitter: faker.internet.userName(),
			instagram: faker.internet.userName(),
			youtube: faker.internet.userName(),
			linkedin: faker.internet.userName(),
			facebook: faker.internet.userName(),
			linkZoom: venue?.region.name == 'Virtual' ? 'https://zoom.com/f24nfkdf234' : null,
			language: venue?.region.name == 'Virtual' ? language : null,
			translation: venue?.region.name == 'Virtual' ? translations : null,
			typeEvent: venue?.region.name == 'Virtual' ? 1 : 0
		}

		const event = await Event.create(eventBody)
		event.setPictures([images.id])
		event.setEventSpeakers(snapshotSpeakers)
		event.setSchedule(
			await Schedule.create({
				startTime: startDate,
				endTime: endDate
			})
		)
		event.setOrganizer(organizer)
		await event.save()
	}
	return allCountries
}

const slugify = (str: string) =>
	str
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, '')
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '')
