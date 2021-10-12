#---- Set up
println("\n\n\n Analysis begins:")
# Criteria
deck_ratio_deviation = 0.3
memory_score = 0.8
reward = 0.25

# Load libraries
using CSV, DataFrames, Statistics, VegaLite

#---- Get data
date = ""
sess = "4"
subdir = "now"

# List relevant files
files = filter(x -> occursin(date, x) &&
    occursin("sess" * sess, x) &&
    !occursin("plan", x) &&
    !occursin("int", x) &&
    occursin("csv", x), readdir("../Data/"* subdir* "/"))

# Open each file, and then vcat them together
dat = reduce(vcat, map(x -> CSV.read("../Data/" * subdir * "/" * x), files))

#---- Exclude Ps who didn't finish

quality = by(dat, :PID, n_w = :n_warnings => maximum) # Summarize warnings each participant recieved

kick = by(dat, :PID, kick = :category => x -> "kick-out" in x)
filter!(x -> !ismissing(x.kick) && x.kick == true, kick)

filter!(r -> !(r.PID in kick.PID), dat) # Filter data according to quality table

println("\nExcluded during experiment:")
println(kick.PID)
#---- Prepare data
# Remove instructions and training
a = filter(r -> r.trial_type == "structure-quiz", dat) |>  # Find structure-quiz as beginning of interesting data
    x -> by(x, [:PID, :sess], start_trial = :trial_index => minimum) # Find fist appearance of
dat = join(dat, a, on = [:PID, :sess]) |> # Join with data
    x -> filter!(r -> r.trial_index >= r.start_trial, x) # filter data

# Deal with missing block number data
for ii in 1:nrow(dat)
    if ismissing(dat[ii, :block])
        dat[ii, :block] = dat[ii - 1, :block]
    end
end

# Make deck names into numbers
dat.LCard = passmissing(x -> parse(Int64, x[8:end])).(dat.LCard)
dat.RCard = passmissing(x -> parse(Int64, x[8:end])).(dat.RCard)
dat.chosen_deck = passmissing(x -> parse(Int64, x[8:end])).(dat.chosen_deck)

# Make table names into numbers
dat.TL = passmissing(x -> parse(Int64, x[end])).(dat.TL)
dat.TR = passmissing(x -> parse(Int64, x[end])).(dat.TR)
dat.chosen_object = passmissing(x -> parse(Int64, x[end])).(dat.chosen_object)
dat.table = passmissing(x -> parse(Int64, x[end])).(dat.table)

# Which deck was chosen?
dat.chosen_deck =
    (x -> !ismissing(x.chosen_deck) ? x.chosen_deck : (ismissing(x.chosen_deck_side) ? missing :
        (x.chosen_deck_side == "L" ? x.LCard : x.RCard))).(eachrow(dat))

#---- Compute bonus payments
bonus = filter(x -> x.trial_type == "test-feedback", dat) |>
    x -> by(x, :PID, correct = :correct => x -> sum((x .== "true") .| (x .== true)))

bonus.reward = (x -> round(x, digits = 2)).(bonus.correct .* reward)

println("\nBonuses:")
println(sort(bonus, [:reward]))

#---- Exclude according to memory quiz
memory = filter(x -> x.trial_type == "memory-quiz", dat) # Select trials
memory = memory[:, filter(x -> !isequal(unique(memory[x]),
    [missing]), names(memory))] # Remove empty variables
memory.correct = memory.chosen_table .== memory.answer # Compute correct

# Plot memory performance
# p = memory |> @vlplot(:bar,
#     x = "block:o",
#     y = "count(correct)",
#     fill = "correct:n",
#     row = "sess:o",
#     column = "PID:n")

memory = by(memory, [:PID], correct = :correct => mean)

pre = nrow(memory)
mem_exc = filter(x -> x.correct < memory_score, memory)
filter!(x -> x.correct >= memory_score, memory)

println("\nRemoved ", pre - nrow(memory), " participants for memory score <=.8")
println(mem_exc.PID)
println("\nAverage memory score remaining: ", mean(memory.correct))

dat = filter(x -> x.PID in memory.PID, dat) # Exclude from data

#---- Exclude according to deck choices
# Separate learning phase
learn = filter(x -> !ismissing(x.category) &&
    x.category in ["object_choice", "deck_choice", "too-quick", "focus-blur"], dat)

# Remove aborted trials
filter!(x -> !(x.category == "object_choice" && x.rt == "null"), learn) # Remove no response object choice trials

bad_indx = []
for ii in nrow(learn):-1:1
    if learn[ii, :category] == "deck_choice" && learn[ii, :rt] == "null"
        push!(bad_indx, ii, ii - 1)
    elseif learn[ii, :category] == "too-quick" || learn[ii, :category] == "focus-blur"
        push!(bad_indx, ii, ii - 1)
        if learn[ii-1, :category] == "deck_choice"
            push!(bad_indx, ii - 2)
        end
    end
end

learn = learn[filter(x -> !(x in bad_indx), 1:nrow(learn)), :]

# Remove empty columns
learn = learn[:, filter(x -> !isequal(unique(learn[x]), [missing]), names(learn))]

# Make RT numeric, on seconds scale
learn.rt = (x -> parse(Float64, x)).(learn.rt) / 1000

# Transform dataframe to have one line per trial: merge table and deck choice lines
wl = filter(x -> x.category == "object_choice", learn)

rename!(wl, :rt => :table_rt)

wl.rt = 0.

for ii in 1:nrow(wl)
    id = wl[ii, :PID]
    sess = wl[ii, :sess]
    bl = wl[ii, :block]
    ind = wl[ii, :trial_index]

    # Candidate row to pull data from - has same Participand ID, same block, matching trial index
    cand = filter(x -> x.PID == id && x.sess == sess && x.block == bl && x.trial_index == ind + 3, learn)
    if nrow(cand) > 0
        for jj in [:LCard, :RCard, :rt, :chosen_deck_side, :chosen_deck, :reward]
            wl[ii, jj] = cand[jj][1]
        end
    end
end

rename!(wl, :rt => :deck_rt);

wl.trial = reduce(vcat, [1:nrow(x) for x in groupby(wl, [:PID, :sess, :block])])

# Count which deck was chosen
decks = by(wl, [:PID, :sess, :block, :chosen_object],
    min_deck = :chosen_deck => x -> minimum(skipmissing(x)))
wl = join(wl, decks, on = [:PID, :sess, :block, :chosen_object])
wl.chosen_deck_N = [x.chosen_deck == x.min_deck ? 1 : 2 for x in eachrow(wl)]

wl.running_table_n = [x.chosen_object + 4 * (x.block) for x in eachrow(wl)]

p2 = wl |> @vlplot(:bar, x = {"running_table_n:o", title = "Table"},
    y = "count()",
    color = {"chosen_deck_N:n", legend = nothing},
    column = {"PID:n", title = "Participant"},
    row = {"sess:n", title = "Session"},
    title = "Deck choice distribution")

# For each subject and game, compute the absolute deviation from choosing both decks 50:50
deck_s = by(wl, [:PID, :running_table_n],
    ratio = :chosen_deck_N => x -> abs(0.5 - mean(x .== 1)),
    n_trials = :chosen_deck_N => length)

# Multiply each table's ratio by the number of trials for that table
deck_s.wrat = deck_s.ratio .* deck_s.n_trials

# Split by subject
deck_s = groupby(deck_s, :PID)

# Compute weighted average
deck_s = DataFrame((x -> (PID = unique(x.PID)[1], wrat = sum(x.wrat) ./ sum(x.n_trials))).(deck_s))

# Remove subjects by exclusion criterion
pre = nrow(deck_s)
deck_exc = filter(x -> x.wrat > deck_ratio_deviation, deck_s)
filter!(x -> x.wrat <= deck_ratio_deviation, deck_s)
println("\nRemoved ", pre - nrow(deck_s), " participants for low entropy deck choices")
println(deck_exc.PID)

# Remove subjects from data
filter!(x -> x.PID in deck_s.PID, dat)

# Print list of PIDs for next session
function completed_next(x)
    next_sess = filter(y -> occursin("sess" * string(parse(Int, sess) + 1), y) &&
        !occursin("plan", y) &&
        !occursin("int", y) &&
        occursin("csv", y), readdir("../Data/"* subdir* "/"))

    sum((y -> occursin(x, y)).(next_sess)) > 0
end

future = filter(x -> completed_next(x), unique(dat.PID))

println("\nPIDs for next session:")
(x -> println(x)).(filter(x -> !(x in future),unique(dat.PID)))
