import asyncio

_queues: dict[str, asyncio.Queue] = {}


def create_queue(analysis_id: str) -> asyncio.Queue:
    q: asyncio.Queue = asyncio.Queue()
    _queues[analysis_id] = q
    return q


def get_queue(analysis_id: str) -> asyncio.Queue | None:
    return _queues.get(analysis_id)


def remove_queue(analysis_id: str) -> None:
    _queues.pop(analysis_id, None)
