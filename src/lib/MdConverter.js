
import { Converter, setOption } from 'showdown';

export async function convert(markdown) {
	return new Promise(async (resolve, reject) => {
		var converter = new Converter();
		converter.setOption('noHeaderId', true);
		converter.setFlavor('github');

		var html = '';
		html = converter.makeHtml(markdown);

		// Simple replaces
		html = html.replaceAll('<em>', '<i>');
		html = html.replaceAll('</em>', '</i>');
		html = html.replaceAll('<strong>', '<em>');
		html = html.replaceAll('</strong>', '</em>');
		html = html.replaceAll('<p>', '');
		html = html.replaceAll('</p>', '\n');
		html = html.replaceAll('</ul>', '</ul>\n');
		html = html.replaceAll('</blockquote>', '</blockquote>\n');

		// DOM manipulation
		let parser = new DOMParser();
		let doc = parser.parseFromString(html, "text/html");
		let imageConvertOutput = await convertLocalPathsToUrls(doc);
		doc = imageConvertOutput.doc;
		let errorUrls = imageConvertOutput.errorUrls;

		html = doc.body.innerHTML;
		html = html.trim();

		var output = {
			html: html,
			errorUrls: errorUrls
		}

		resolve(output);
	});
}

function convertLocalPathsToUrls(doc) {
	return new Promise((resolve, reject) => {

		let imgElements = doc.getElementsByTagName("img");

		// If there are no images, return
		if (imgElements.length < 1) {
			var output = {
				doc: doc,
				errorUrls: []
			}
			resolve(output);
		}

		const today = new Date();
		const year = today.getFullYear();
		const month = today.getMonth() + 1; // getMonth() returns a 0-based index, so we need to add 1 to get the actual month number
		const formattedDate = year + "/" + (month < 10 ? "0" + month : month);

		let mediaUrl = "https://files.koenig.kodeco.com/uploads/" + formattedDate + "/"

		let totalPromises = imgElements.length;
		let resolvedPromises = 0;
		let errorUrls = [];

		for (let i = 0; i < imgElements.length; i++) {
			var urlParts = imgElements[i].src.split("/")
			var fileName = urlParts[urlParts.length - 1];

			// Replace local with remote image url
			imgElements[i].src = mediaUrl + fileName;

			imageExists(mediaUrl + fileName)
				.then(function (exists) {
					// // console.log(exists);
					resolvedPromises++;

					if (!exists) {
						errorUrls.push(mediaUrl + fileName);
					}

					if (resolvedPromises === totalPromises) {
						//All promises have been resolved
						console.log("All promises resolved!");
						console.log("Not found:");
						console.log(errorUrls);

						var output = {
							doc: doc,
							errorUrls: errorUrls
						}

						resolve(output);
					}
				});
		}
	});
}


function imageExists(url) {
	return new Promise(function (resolve, reject) {
		var image = new Image();
		image.onload = function () {
			if (image.width > 0) {
				resolve(true);
			}
		}
		image.onerror = function () {
			resolve(false);
		}
		image.src = url;
	});
}