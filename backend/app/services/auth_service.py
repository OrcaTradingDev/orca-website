from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User

async def upsert_google_user(
    session: AsyncSession,
    email: str,
    google_sub: str,
    full_name: str | None = None,
    picture_url: str | None = None,
) -> User:
    """
    Checks if a user exists by their Google Subject ID.
    If they exist, updates their profile info and returns them.
    If they don't exist, creates a new free-tier user and returns them.
    """
    
    # 1. Check if the user already exists
    query = select(User).where(User.google_sub == google_sub)
    result = await session.execute(query)
    existing_user = result.scalars().first()

    if existing_user:
        # 2A. User exists! Update their picture/name in case they changed it on Google
        existing_user.full_name = full_name
        existing_user.picture_url = picture_url
        
        await session.commit()
        await session.refresh(existing_user)
        return existing_user

    # 2B. User does not exist. Create a new one!
    new_user = User(
        email=email,
        google_sub=google_sub,
        full_name=full_name,
        picture_url=picture_url,
        # tier defaults to "FREE" as defined in your model
    )
    
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    
    return new_user
