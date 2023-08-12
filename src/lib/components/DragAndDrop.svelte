<script lang="ts">
	import Icon from 'svelte-icons-pack'
	import BsCloudUpload from 'svelte-icons-pack/bs/BsCloudUpload'
	import BsImageFill from 'svelte-icons-pack/bs/BsImageFill'
	import HiOutlineTrash from 'svelte-icons-pack/hi/HiOutlineTrash'
	import AiOutlineCloseCircle from 'svelte-icons-pack/ai/AiOutlineCloseCircle'
	import FaSolidRedo from 'svelte-icons-pack/fa/FaSolidRedo'
	import MainButton from './MainButton.svelte'
	import { Circle } from 'svelte-loading-spinners'
	import HorizontalScroll from './HorizontalScroll.svelte'
	interface FileUpload {
		file: File
		progress: number
		request?: XMLHttpRequest
		image: string | null
		status: number
		resourceId?: number
		pendingAction: boolean
	}

	export let url: string
	export let name: string
	export let title: string = ''
	export let subtitle: string = ''
	export let body: string = ''
	export let multiple: boolean = true
	export let uploaded: number[] = []

	let files: FileUpload[] = []
	let inputRef: HTMLInputElement

	const allowedFormats = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp']

	function handleDrop(event: any) {
		event.preventDefault()
		if (!multiple && uploaded.length > 0) {
			alert('You can only upload one file here')
		} else {
			for (const file of event.dataTransfer.files) {
				if (file.size > 2097152) {
					alert('File is too big!')
				} else if (allowedFormats.includes(file.type)) {
					uploadFile(file)
					console.log(file)
				} else {
					alert("File's format not supported")
				}
			}
		}
	}

	function handleDragOver(event: any) {
		event.preventDefault()
	}

	function handleInputFile(event: any) {
		if (!multiple && uploaded.length > 0) {
			alert('You can only upload one file here')
		} else {
			for (const file of inputRef.files || []) {
				if (file.size > 2097152) {
					alert('File is too big!')
				} else if (allowedFormats.includes(file.type)) {
					uploadFile(file)
					console.log(file)
				} else {
					alert("File's format not supported")
				}
			}
		}
	}

	async function removeFile(file: FileUpload) {
		if (file.resourceId && file.pendingAction == false) {
			file.pendingAction = true
			files = files
			await fetch(`${url}/${file.resourceId}`, {
				method: 'DELETE'
			})
			file.pendingAction = false
			files = files.filter((item) => item.resourceId != file.resourceId)
		}
	}

	function abortFile(file: FileUpload) {
		if (file.request) {
			file.request.abort()
		}
	}

	function retryFile(file: FileUpload) {
		file.status = 0
		file.progress = 0
		assignRequest(file)
		files = files
	}

	async function assignRequest(fileUpload: FileUpload) {
		const request = await fetch(url, {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify({
				name: fileUpload.file.name
			})
		})
		if (request.ok) {
			const { resource, uploadUrl } = await request.json()
			const uploadRequest = new XMLHttpRequest()

			uploadRequest.upload.addEventListener('progress', (event) => {
				if (event.lengthComputable) {
					fileUpload.progress = event.loaded / event.total
					files = files
				}
			})

			uploadRequest.onreadystatechange = function () {
				if (uploadRequest.readyState == XMLHttpRequest.DONE) {
					if (uploadRequest.status == 200) {
						fileUpload.status = 1
					} else {
						fileUpload.status = 2
					}
					files = files
				}
			}

			uploadRequest.onerror = function () {
				fileUpload.status = 2
				files = files
			}
			uploadRequest.onabort = function () {
				fileUpload.status = 2
				files = files.filter((item) => item.resourceId != fileUpload.resourceId)
			}
			fileUpload.resourceId = resource.id
			fileUpload.request = uploadRequest
			files = files
			uploadRequest.open('PUT', uploadUrl)
			uploadRequest.setRequestHeader('Content-Type', fileUpload.file.type)
			uploadRequest.send(fileUpload.file)
		} else {
			fileUpload.status = 2
			files = files
		}
	}

	async function uploadFile(file: File) {
		const fileUpload: FileUpload = {
			file,
			progress: 0,
			status: 0,
			pendingAction: false,
			image: null
		}
		assignRequest(fileUpload)
		const reader = new FileReader()
		reader.addEventListener('load', () => {
			fileUpload.image = reader.result as string
			files = files
		})
		files.push(fileUpload)
		files = files
		reader.readAsDataURL(file)
	}

	$: uploaded = files.filter((item) => item.status == 1).map((item) => item.resourceId as number)
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="mainContainer">
	<input
		bind:this={inputRef}
		on:change={handleInputFile}
		accept=".png,.jpg,.jpeg,.webp"
		type="file"
		hidden
		{multiple}
	/>
	{#if files.length == 0}
		<div
			class="content"
			on:drop={handleDrop}
			on:dragover={handleDragOver}
			on:click={() => inputRef.click()}
		>
			<div class="header">
				<div class="title">{title}</div>
				<div class="subtitle">{subtitle}</div>
			</div>
			<div class="body">
				<div class="icon">
					<Icon src={BsCloudUpload} color="currentColor" size="38px" />
				</div>
				<span>{body}</span>
			</div>
			<div class="footer">Drag and drop or browse to choose a file</div>
		</div>
	{:else}
		<div class="content borderless" on:drop={handleDrop} on:dragover={handleDragOver}>
			<div class="header">
				<div class="title">{title}</div>
				<div class="subtitle">{subtitle}</div>
			</div>
			<div class="filesContainer">
				<HorizontalScroll aspectRatio={16 / 9} itemWidth="30%">
					{#each files as fileUpload}
						<div class="imageItem">
							{#if fileUpload.image}
								<img class="thumbnail" src={fileUpload.image} alt="thumbnail" />
							{/if}
							{#if fileUpload.status == 0}
								<div class="loading">
									<Circle
										size="20"
										color="currentColor"
										unit="px"
										duration="1s"
									/>
								</div>
							{/if}
						</div>
					{/each}
				</HorizontalScroll>
				<div class="list">
					<div class="title">
						{uploaded.length} of {files.length} Uploaded
					</div>
					{#each files as fileUpload}
						<div class="item">
							<div class="progress" style={`width: ${fileUpload.progress * 100}%`} />
							<div class="itemContent" class:error={fileUpload.status == 2}>
								<div class="icon">
									<Icon src={BsImageFill} size="38px" color="currentColor" />
								</div>
								<div class="text">
									{fileUpload.file.name}
								</div>
								<div class="actions">
									{#if fileUpload.pendingAction}
										<div class="action">
											<Circle
												size="20"
												color="currentColor"
												unit="px"
												duration="1s"
											/>
										</div>
									{:else if fileUpload.status == 0}
										<div class="action" on:click={() => abortFile(fileUpload)}>
											<Icon
												src={AiOutlineCloseCircle}
												size="20px"
												color="currentColor"
											/>
										</div>
									{:else if fileUpload.status == 1}
										<div class="action" on:click={() => removeFile(fileUpload)}>
											<Icon
												src={HiOutlineTrash}
												size="20px"
												color="currentColor"
											/>
										</div>
									{:else if fileUpload.status == 2}
										<div class="action" on:click={() => retryFile(fileUpload)}>
											<Icon
												src={FaSolidRedo}
												size="20px"
												color="currentColor"
											/>
										</div>
									{/if}
								</div>
							</div>
						</div>
					{/each}
					<MainButton type="button" on:click={() => inputRef.click()}
						>Upload photo</MainButton
					>
				</div>
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.mainContainer {
		width: 100%;
	}

	.imageItem {
		width: 200px;
		min-width: 200px;
		position: relative;
		aspect-ratio: calc(16 / 9);
		background-color: #616161;
		border-radius: 0.7em;
		overflow: hidden;
		.thumbnail {
			width: 100%;
			height: 100%;
			object-fit: contain;
		}
		.loading {
			position: absolute;
			inset: 0;
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}

	.content {
		font-family: var(--font-eesti);
		display: flex;
		flex-flow: column;
		align-items: center;
		justify-content: center;
		padding: 1em;
		border: 1px dashed #000;
		border-radius: 1em;
		width: 100%;
		color: var(--neutral-4);
		gap: 2em;
		cursor: pointer;
		&.borderless {
			cursor: auto;
			border: none;
			padding: none;
		}
		&:hover {
			background-color: #00000005;
		}
		.header {
			display: flex;
			align-items: center;
			justify-content: center;
			flex-flow: column;
			.title {
				font-weight: 400;
				font-size: 20px;
			}
			.subtitle {
				font-weight: 200;
				font-size: 20px;
			}
		}
		.body {
			span {
				font-size: 20px;
				color: var(--neutral-4);
				font-weight: 200;
			}
		}
		.icon {
			display: flex;
			flex-flow: column;
			align-items: center;
			color: var(--primary-hover);
		}

		.footer {
			color: var(--neutral-3);
			font-weight: 375;
			letter-spacing: 0.5px;
			font-size: 20px;
			line-height: 30px; /* 150% */
		}

		.filesContainer {
			display: flex;
			flex-flow: column;
			align-items: center;
			justify-content: center;
			width: 100%;
			.list {
				width: 100%;
				display: flex;
				flex-flow: column;
				align-items: center;
				justify-content: center;
				gap: 1em;
				.title {
					color: var(--neutral-3);
					font-weight: 300;
					width: 100%;
				}
				.item {
					display: flex;
					align-items: center;
					position: relative;
					padding: 1em;
					color: #fff;
					background-color: var(--neutral-1);
					gap: 1em;
					border-radius: 0.7em;
					width: 100%;
					overflow: hidden;
					.progress {
						position: absolute;
						top: 0;
						left: 0;
						bottom: 0;
						background: var(--gd-icon);
						transition: all 0.2s ease-in-out;
					}
					.itemContent {
						display: flex;
						align-items: center;
						justify-content: center;
						gap: 1em;
						position: relative;
						width: 100%;
						color: #fff;
						&.error {
							color: #d8935a;
						}
					}
					.icon {
						color: #fff;
					}
					.text {
						overflow: hidden;
						flex-grow: 1;
						white-space: nowrap;
						text-overflow: ellipsis;
					}
					.actions {
						display: flex;
						gap: 1em;
						align-items: center;
						justify-content: center;
						.action {
							background-color: #fff;
							color: var(--neutral-4);
							padding: 0.3em 0.6em;
							border-radius: 0.5em;
							cursor: pointer;
						}
					}
				}
			}
		}
	}
</style>
