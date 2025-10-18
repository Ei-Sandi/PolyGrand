"""
Tournament routes - Create and manage prediction tournaments
"""

import uuid
from typing import List
from datetime import datetime

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse

from models.tournament import Tournament, TournamentStatus
from schemas.tournament import (
    CreateTournamentRequest,
    TournamentResponse,
    JoinTournamentRequest,
    SubmitPredictionRequest
)
from storage import storage
from services.websocket import websocket_manager

router = APIRouter()


@router.post("/", response_model=TournamentResponse, status_code=status.HTTP_201_CREATED)
async def create_tournament(request: CreateTournamentRequest) -> TournamentResponse:
    """
    Create a new prediction tournament

    Tournaments allow users to compete across multiple markets
    Winner is determined by prediction accuracy
    """
    try:
        # Validate all markets exist
        for market_id in request.market_ids:
            market = storage.get_market(market_id)
            if not market:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Market {market_id} not found"
                )

        # Generate tournament ID
        tournament_id = f"tournament_{uuid.uuid4().hex[:12]}"

        # Create tournament
        tournament = Tournament(
            id=tournament_id,
            name=request.name,
            description=request.description,
            creator_address=request.creator_address,
            market_ids=request.market_ids,
            entry_fee=request.entry_fee,
            prize_pool=request.prize_pool,
            start_time=request.start_time,
            end_time=request.end_time,
            max_participants=request.max_participants
        )

        storage.create_tournament(tournament)

        # Broadcast tournament creation
        await websocket_manager.broadcast(
            f"New tournament created: {tournament.name}"
        )

        return TournamentResponse(**tournament.to_dict())

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create tournament: {str(e)}"
        )


@router.get("/", response_model=List[TournamentResponse])
async def get_tournaments(
    status_filter: str | None = None,
    limit: int = 100
) -> List[TournamentResponse]:
    """
    Get all tournaments with optional filtering

    Query Parameters:
    - status: Filter by tournament status (pending, active, completed)
    - limit: Maximum number of tournaments to return
    """
    tournaments = storage.get_all_tournaments()

    # Apply filters
    if status_filter:
        tournaments = [t for t in tournaments if t.status.value == status_filter]

    # Sort by created_at (newest first)
    tournaments = sorted(tournaments, key=lambda t: t.created_at, reverse=True)

    # Apply limit
    tournaments = tournaments[:limit]

    return [TournamentResponse(**t.to_dict()) for t in tournaments]


@router.get("/{tournament_id}", response_model=TournamentResponse)
async def get_tournament(tournament_id: str) -> TournamentResponse:
    """Get a single tournament by ID"""
    tournament = storage.get_tournament(tournament_id)

    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tournament {tournament_id} not found"
        )

    return TournamentResponse(**tournament.to_dict())


@router.post("/{tournament_id}/join", response_model=TournamentResponse)
async def join_tournament(
    tournament_id: str,
    request: JoinTournamentRequest
) -> TournamentResponse:
    """
    Join a tournament

    Requires entry fee payment (if applicable)
    Tournament must be in PENDING status
    """
    tournament = storage.get_tournament(tournament_id)

    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tournament {tournament_id} not found"
        )

    if tournament.status != TournamentStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tournament has already started or is completed"
        )

    if len(tournament.participants) >= tournament.max_participants:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tournament is full"
        )

    if request.participant_address in tournament.participants:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already joined this tournament"
        )

    # Add participant
    tournament.participants.append(request.participant_address)
    tournament.participant_scores[request.participant_address] = 0.0

    storage.update_tournament(tournament_id, tournament)

    # Update user stats
    user = storage.get_or_create_user(request.participant_address)
    user.tournaments_joined += 1

    # Broadcast tournament update
    await websocket_manager.send_tournament_update(
        tournament_id=tournament_id,
        update_type="participant_joined",
        data={
            "participant": request.participant_address,
            "total_participants": len(tournament.participants)
        }
    )

    return TournamentResponse(**tournament.to_dict())


@router.post("/{tournament_id}/start", response_model=TournamentResponse)
async def start_tournament(tournament_id: str, creator_address: str) -> TournamentResponse:
    """
    Start a tournament

    Only creator can start
    Tournament must be in PENDING status
    """
    tournament = storage.get_tournament(tournament_id)

    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tournament {tournament_id} not found"
        )

    if creator_address != tournament.creator_address:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only tournament creator can start the tournament"
        )

    if tournament.status != TournamentStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tournament has already started or is completed"
        )

    if len(tournament.participants) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Need at least 2 participants to start"
        )

    # Start tournament
    tournament.status = TournamentStatus.ACTIVE
    storage.update_tournament(tournament_id, tournament)

    # Broadcast tournament start
    await websocket_manager.send_tournament_update(
        tournament_id=tournament_id,
        update_type="started",
        data={
            "start_time": datetime.utcnow().isoformat(),
            "participants": tournament.participants
        }
    )

    return TournamentResponse(**tournament.to_dict())


@router.post("/{tournament_id}/predict", response_model=TournamentResponse)
async def submit_prediction(
    tournament_id: str,
    request: SubmitPredictionRequest
) -> TournamentResponse:
    """
    Submit predictions for tournament markets

    Participants submit their predictions for each market
    Predictions are locked once submitted
    """
    tournament = storage.get_tournament(tournament_id)

    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tournament {tournament_id} not found"
        )

    if tournament.status != TournamentStatus.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tournament is not active"
        )

    if request.participant_address not in tournament.participants:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a participant in this tournament"
        )

    # Validate predictions
    for market_id, outcome in request.predictions.items():
        if market_id not in tournament.market_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Market {market_id} is not part of this tournament"
            )

        market = storage.get_market(market_id)
        if not market:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Market {market_id} not found"
            )

        if outcome not in market.outcomes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid outcome {outcome} for market {market_id}"
            )

    # Save predictions
    tournament.predictions[request.participant_address] = request.predictions

    storage.update_tournament(tournament_id, tournament)

    # Broadcast prediction submission
    await websocket_manager.send_tournament_update(
        tournament_id=tournament_id,
        update_type="prediction_submitted",
        data={
            "participant": request.participant_address,
            "markets_predicted": len(request.predictions)
        }
    )

    return TournamentResponse(**tournament.to_dict())


@router.post("/{tournament_id}/complete", response_model=TournamentResponse)
async def complete_tournament(tournament_id: str, creator_address: str) -> TournamentResponse:
    """
    Complete a tournament and calculate winners

    Scores participants based on prediction accuracy
    Distributes prizes to top performers
    """
    tournament = storage.get_tournament(tournament_id)

    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tournament {tournament_id} not found"
        )

    if creator_address != tournament.creator_address:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only tournament creator can complete the tournament"
        )

    if tournament.status == TournamentStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tournament already completed"
        )

    # Calculate scores
    for participant in tournament.participants:
        score = 0.0
        predictions = tournament.predictions.get(participant, {})

        for market_id, predicted_outcome in predictions.items():
            market = storage.get_market(market_id)
            if market and market.resolved_outcome:
                if predicted_outcome == market.resolved_outcome:
                    score += 1.0

        tournament.participant_scores[participant] = score

    # Determine winners (top 3)
    sorted_participants = sorted(
        tournament.participants,
        key=lambda p: tournament.participant_scores.get(p, 0),
        reverse=True
    )
    tournament.winners = sorted_participants[:3]

    # Distribute prizes (simple distribution: 50%, 30%, 20%)
    if len(tournament.winners) >= 1:
        tournament.prize_distribution[tournament.winners[0]] = tournament.prize_pool * 0.5
    if len(tournament.winners) >= 2:
        tournament.prize_distribution[tournament.winners[1]] = tournament.prize_pool * 0.3
    if len(tournament.winners) >= 3:
        tournament.prize_distribution[tournament.winners[2]] = tournament.prize_pool * 0.2

    # Update status
    tournament.status = TournamentStatus.COMPLETED

    storage.update_tournament(tournament_id, tournament)

    # Broadcast completion
    await websocket_manager.send_tournament_update(
        tournament_id=tournament_id,
        update_type="completed",
        data={
            "winners": tournament.winners,
            "scores": tournament.participant_scores
        }
    )

    return TournamentResponse(**tournament.to_dict())


@router.get("/{tournament_id}/leaderboard")
async def get_tournament_leaderboard(tournament_id: str) -> JSONResponse:
    """Get tournament leaderboard"""
    tournament = storage.get_tournament(tournament_id)

    if not tournament:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tournament {tournament_id} not found"
        )

    # Sort by score
    leaderboard = [
        {
            "rank": idx + 1,
            "participant": participant,
            "score": tournament.participant_scores.get(participant, 0),
            "prize": tournament.prize_distribution.get(participant, 0)
        }
        for idx, participant in enumerate(
            sorted(
                tournament.participants,
                key=lambda p: tournament.participant_scores.get(p, 0),
                reverse=True
            )
        )
    ]

    return JSONResponse({
        "tournament_id": tournament_id,
        "tournament_name": tournament.name,
        "status": tournament.status.value,
        "leaderboard": leaderboard
    })
