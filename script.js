document.addEventListener("DOMContentLoaded", function () {
	const nextButton = document.getElementById("nextButton");
	const generateQuarterFinalsButton = document.getElementById(
		"generateQuarterFinals"
	);
	const initialTeamsContainer = document.getElementById("initialTeams");
	const round1Element = document.getElementById("round1");
	const round2Element = document.getElementById("round2");
	const quarterFinalsElement = document.getElementById("quarterFinals");
	const roundsContainer = document.getElementById("roundsContainer");
	const qualifiedInputs = document.querySelectorAll(".team-input");
	const semiFinalsElement = document.getElementById("semiFinals");
	const semiFinalistInputs = document.querySelectorAll(".semi-finalist-input");

	// Initialize teams
	const teams = Array.from({ length: 16 }, (_, i) => `T${i + 1}`);
	let shuffledTeams = [];
	let round1Pairings = [];
	let round2Pairings = [];
	let currentMatchIndex = 0;
	let currentRound = 1;
	let quarterFinalsPairings = [];
	let quarterFinalsMatchIndex = 0;
	let semiFinalsPairings = [];
	let semiFinalsMatchIndex = 0;

	// Create initial team blocks
	function createTeamBlocks() {
		initialTeamsContainer.innerHTML = "";
		teams.forEach((team) => {
			const teamBlock = document.createElement("div");
			teamBlock.className = "team-block";
			teamBlock.id = `team-${team}`;
			teamBlock.textContent = team;
			initialTeamsContainer.appendChild(teamBlock);
		});
	}

	// Initialize the page
	createTeamBlocks();

	// Generate initial pairings immediately
	generatePairings(shuffleArray([...teams]));
	nextButton.disabled = false;

	// Monitor qualified teams inputs
	qualifiedInputs.forEach((input) => {
		input.addEventListener("input", checkQualifiedTeams);
	});

	// Add validation for unique team names
	function validateUniqueTeams() {
		const teamNames = new Set();
		let isValid = true;

		qualifiedInputs.forEach((input) => {
			const value = input.value.trim();
			if (value !== "") {
				if (teamNames.has(value)) {
					input.classList.add("error");
					isValid = false;
				} else {
					input.classList.remove("error");
					teamNames.add(value);
				}
			}
		});

		return isValid;
	}

	// Update checkQualifiedTeams function
	function checkQualifiedTeams() {
		const allFilled = Array.from(qualifiedInputs).every(
			(input) => input.value.trim() !== ""
		);
		const isValid = validateUniqueTeams();
		generateQuarterFinalsButton.disabled = !allFilled || !isValid;

		if (allFilled && isValid) {
			// Enable the button only if we haven't started showing matches yet
			generateQuarterFinalsButton.disabled = quarterFinalsMatchIndex > 0;
		}
	}

	generateQuarterFinalsButton.addEventListener("click", function () {
		if (quarterFinalsMatchIndex === 0) {
			// First click - generate pairings
			if (!validateUniqueTeams()) {
				alert("Each qualified team must have a unique name");
				return;
			}

			// Get and shuffle qualified teams
			const qualifiedTeams = Array.from(qualifiedInputs).map((input) =>
				input.value.trim()
			);
			const shuffledQualifiedTeams = shuffleArray([...qualifiedTeams]);

			// Create pairings
			quarterFinalsPairings = [];
			for (let i = 0; i < shuffledQualifiedTeams.length; i += 2) {
				quarterFinalsPairings.push({
					petitioner: shuffledQualifiedTeams[i],
					respondent: shuffledQualifiedTeams[i + 1],
				});
			}

			// Clear quarter finals only on first generation
			quarterFinalsElement.innerHTML = "";
			semiFinalsElement.innerHTML = "";
			generateSemiFinalsButton.disabled = true;
			semiFinalsMatchIndex = 0;

			// Change button text
			generateQuarterFinalsButton.textContent = "Next Quarter Final";
		}

		// Show next match
		animateNextQuarterFinal();
	});

	// Create Generate Semi Finals button
	const generateSemiFinalsButton = document.createElement("button");
	generateSemiFinalsButton.id = "generateSemiFinals";
	generateSemiFinalsButton.className = "button";
	generateSemiFinalsButton.textContent = "Generate Semi Finals";
	generateSemiFinalsButton.disabled = true;
	document
		.querySelector(".buttons-container")
		.appendChild(generateSemiFinalsButton);

	generateSemiFinalsButton.addEventListener("click", function () {
		if (semiFinalsMatchIndex === 0) {
			if (!validateSemiFinalists()) {
				alert("Each semi-finalist must have a unique name");
				return;
			}

			// Get semi-finalists from inputs
			const semiFinalists = Array.from(semiFinalistInputs).map((input) =>
				input.value.trim()
			);
			const shuffledSemiFinalists = shuffleArray([...semiFinalists]);

			// Create semi-finals pairings
			semiFinalsPairings = [];
			for (let i = 0; i < shuffledSemiFinalists.length; i += 2) {
				semiFinalsPairings.push({
					petitioner: shuffledSemiFinalists[i],
					respondent: shuffledSemiFinalists[i + 1],
				});
			}

			// Clear semi finals only on first generation
			semiFinalsElement.innerHTML = "";

			// Change button text
			generateSemiFinalsButton.textContent = "Next Semi Final";
		}

		// Show next match
		animateNextSemiFinal();
	});

	function animateNextSemiFinal() {
		if (semiFinalsMatchIndex < semiFinalsPairings.length) {
			const pair = semiFinalsPairings[semiFinalsMatchIndex];

			// Create and animate the pair
			const pairDiv = document.createElement("div");
			pairDiv.className = "pair";
			pairDiv.innerHTML = `
                <div class="match-number">Semi Final ${
									semiFinalsMatchIndex + 1
								}</div>
                <div class="team">
                    <span class="team-name">${pair.petitioner}</span>
                    <span class="role petitioner">Petitioner</span>
                </div>
                <div class="team">
                    <span class="team-name">${pair.respondent}</span>
                    <span class="role respondent">Respondent</span>
                </div>
            `;
			semiFinalsElement.appendChild(pairDiv);

			// Remove any previous 'selected' and 'animated' classes
			semiFinalistInputs.forEach((input) => {
				input.classList.remove("selected", "animated");
			});

			// Animate the teams in the input fields
			const petitionerInput = Array.from(semiFinalistInputs).find(
				(input) => input.value.trim() === pair.petitioner
			);
			const respondentInput = Array.from(semiFinalistInputs).find(
				(input) => input.value.trim() === pair.respondent
			);

			if (petitionerInput) petitionerInput.classList.add("selected");
			if (respondentInput) respondentInput.classList.add("selected");

			setTimeout(() => {
				if (petitionerInput) petitionerInput.classList.add("animated");
				if (respondentInput) respondentInput.classList.add("animated");
				pairDiv.classList.add("show");
			}, 500);

			semiFinalsMatchIndex++;

			// Disable the button when all matches are shown
			if (semiFinalsMatchIndex === semiFinalsPairings.length) {
				generateSemiFinalsButton.disabled = true;
			}
		}
	}

	// Add input event listeners for validation
	qualifiedInputs.forEach((input) => {
		input.addEventListener("input", () => {
			input.value = input.value.trim();
			checkQualifiedTeams();
		});
	});

	semiFinalistInputs.forEach((input) => {
		input.addEventListener("input", () => {
			input.value = input.value.trim();
			checkSemiFinalists();
		});
	});

	function validateSemiFinalists() {
		const teamNames = new Set();
		let isValid = true;

		semiFinalistInputs.forEach((input) => {
			const value = input.value.trim();
			if (value !== "") {
				if (teamNames.has(value)) {
					input.classList.add("error");
					isValid = false;
				} else {
					input.classList.remove("error");
					teamNames.add(value);
				}
			}
		});

		return isValid;
	}

	function checkSemiFinalists() {
		const allFilled = Array.from(semiFinalistInputs).every(
			(input) => input.value.trim() !== ""
		);
		const isValid = validateSemiFinalists();
		generateSemiFinalsButton.disabled = !allFilled || !isValid;

		if (allFilled && isValid) {
			generateSemiFinalsButton.disabled = semiFinalsMatchIndex > 0;
		}
	}

	nextButton.addEventListener("click", function () {
		animateNextMatch();
	});

	function shuffleArray(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

	function generatePairings(teams) {
		// Create pairings for Round 1
		round1Pairings = [];
		for (let i = 0; i < teams.length; i += 2) {
			round1Pairings.push({
				petitioner: teams[i],
				respondent: teams[i + 1],
			});
		}

		// Create pairings for Round 2 ensuring teams switch roles
		// and don't face the same opponent
		const petitionersR1 = round1Pairings.map((pair) => pair.petitioner);
		const respondentsR1 = round1Pairings.map((pair) => pair.respondent);

		let isValid = false;
		while (!isValid) {
			isValid = true;
			// Shuffle both groups to ensure teams don't face the same opponents
			const shuffledPetitionersR1 = shuffleArray([...petitionersR1]);
			const shuffledRespondentsR1 = shuffleArray([...respondentsR1]);

			round2Pairings = [];
			// Create Round 2 pairings - petitioners from round 1 become respondents and vice versa
			for (let i = 0; i < shuffledPetitionersR1.length; i++) {
				round2Pairings.push({
					petitioner: shuffledRespondentsR1[i],
					respondent: shuffledPetitionersR1[i],
				});
			}

			// Verify that no team faces the same opponent in both rounds
			const pairsCheck = new Set();
			round1Pairings.forEach((pair) => {
				pairsCheck.add(`${pair.petitioner}-${pair.respondent}`);
				pairsCheck.add(`${pair.respondent}-${pair.petitioner}`);
			});

			for (const pair of round2Pairings) {
				if (
					pairsCheck.has(`${pair.petitioner}-${pair.respondent}`) ||
					pairsCheck.has(`${pair.respondent}-${pair.petitioner}`)
				) {
					isValid = false;
					break;
				}
			}
		}
	}

	function animateNextMatch() {
		if (currentRound === 1 && currentMatchIndex < round1Pairings.length) {
			// Animate Round 1 match
			const pair = round1Pairings[currentMatchIndex];
			animateTeamsToMatch(pair, currentMatchIndex, round1Element);
			currentMatchIndex++;

			if (currentMatchIndex === round1Pairings.length) {
				currentRound = 2;
				currentMatchIndex = 0;
			}
		} else if (
			currentRound === 2 &&
			currentMatchIndex < round2Pairings.length
		) {
			// Animate Round 2 match
			const pair = round2Pairings[currentMatchIndex];
			animateTeamsToMatch(pair, currentMatchIndex, round2Element);
			currentMatchIndex++;

			if (currentMatchIndex === round2Pairings.length) {
				// All matches are done
				nextButton.disabled = true;
			}
		}
	}

	function animateTeamsToMatch(pair, index, roundElement) {
		// Highlight the teams that are being paired
		const petitionerBlock = document.getElementById(`team-${pair.petitioner}`);
		const respondentBlock = document.getElementById(`team-${pair.respondent}`);

		petitionerBlock.classList.add("selected");
		respondentBlock.classList.add("selected");

		// After a short delay, animate them to the match
		setTimeout(() => {
			petitionerBlock.classList.add("animated");
			respondentBlock.classList.add("animated");

			// Create the match in the round
			const pairDiv = document.createElement("div");
			pairDiv.className = "pair";
			pairDiv.innerHTML = `
                <div class="match-number">Match ${index + 1}</div>
                <div class="team">
                    <span class="team-name">${pair.petitioner}</span>
                    <span class="role petitioner">Petitioner</span>
                </div>
                <div class="team">
                    <span class="team-name">${pair.respondent}</span>
                    <span class="role respondent">Respondent</span>
                </div>
            `;
			roundElement.appendChild(pairDiv);

			// Show the match with animation
			setTimeout(() => {
				pairDiv.classList.add("show");
			}, 100);
		}, 500);
	}

	// Update animateNextQuarterFinal to enable semi-finals button
	function animateNextQuarterFinal() {
		if (quarterFinalsMatchIndex < quarterFinalsPairings.length) {
			const pair = quarterFinalsPairings[quarterFinalsMatchIndex];

			// Create and animate the pair
			const pairDiv = document.createElement("div");
			pairDiv.className = "pair";
			pairDiv.innerHTML = `
                <div class="match-number">Quarter Final ${
									quarterFinalsMatchIndex + 1
								}</div>
                <div class="team">
                    <span class="team-name">${pair.petitioner}</span>
                    <span class="role petitioner">Petitioner</span>
                </div>
                <div class="team">
                    <span class="team-name">${pair.respondent}</span>
                    <span class="role respondent">Respondent</span>
                </div>
            `;
			quarterFinalsElement.appendChild(pairDiv);

			// Remove any previous 'selected' and 'animated' classes from all inputs
			qualifiedInputs.forEach((input) => {
				input.classList.remove("selected", "animated");
			});

			// Animate the teams in the input fields
			const petitionerInput = Array.from(qualifiedInputs).find(
				(input) => input.value.trim() === pair.petitioner
			);
			const respondentInput = Array.from(qualifiedInputs).find(
				(input) => input.value.trim() === pair.respondent
			);

			if (petitionerInput) petitionerInput.classList.add("selected");
			if (respondentInput) respondentInput.classList.add("selected");

			setTimeout(() => {
				if (petitionerInput) petitionerInput.classList.add("animated");
				if (respondentInput) respondentInput.classList.add("animated");
				pairDiv.classList.add("show");
			}, 500);

			quarterFinalsMatchIndex++;

			// Enable semi-finals button when all quarter finals are shown
			if (quarterFinalsMatchIndex === quarterFinalsPairings.length) {
				generateQuarterFinalsButton.disabled = true;
				generateSemiFinalsButton.disabled = false;
			}
		}
	}
});
